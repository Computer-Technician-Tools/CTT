#![forbid(unsafe_code)]

use std::env;
use std::fs;
use std::io::{Read, Write, copy};
use std::net::{TcpListener, TcpStream};
use std::path::{Component, Path, PathBuf};
use std::sync::{Arc, Mutex, mpsc};
use std::thread;
use std::time::Duration;

const MAX_HEADER_BYTES: usize = 16 * 1024;
const WORKER_COUNT: usize = 4;
const QUEUE_CAPACITY: usize = 64;

fn main() -> std::io::Result<()> {
    let address = env::var("CTT_ADDR").unwrap_or_else(|_| "127.0.0.1:8080".to_string());
    let build_dir = env::var_os("CTT_BUILD_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("build"));
    let build_dir = fs::canonicalize(build_dir)?;
    let listener = TcpListener::bind(&address)?;
    println!("CTT Rust static server listening on http://{address}");

    let (sender, receiver) = mpsc::sync_channel::<TcpStream>(QUEUE_CAPACITY);
    let receiver = Arc::new(Mutex::new(receiver));
    for _ in 0..WORKER_COUNT {
        let receiver = Arc::clone(&receiver);
        let root = build_dir.clone();
        thread::spawn(move || loop {
            let connection = receiver.lock().expect("connection queue poisoned").recv();
            match connection {
                Ok(stream) => {
                    if let Err(error) = handle_connection(stream, &root) {
                        eprintln!("request error: {error}");
                    }
                }
                Err(_) => break,
            }
        });
    }

    for connection in listener.incoming() {
        match connection {
            Ok(stream) => if let Err(mpsc::TrySendError::Full(mut stream)) = sender.try_send(stream) {
                let _ = write_response(&mut stream, 503, "text/plain; charset=utf-8", "no-store", b"Server busy", false, false);
            },
            Err(error) => eprintln!("connection error: {error}"),
        }
    }
    Ok(())
}

fn handle_connection(mut stream: TcpStream, root: &Path) -> std::io::Result<()> {
    stream.set_read_timeout(Some(Duration::from_secs(10)))?;
    stream.set_write_timeout(Some(Duration::from_secs(10)))?;
    let Some(request) = read_request(&mut stream)? else {
        return Ok(());
    };
    let Some((method, target)) = request.lines().next().and_then(parse_request_line) else {
        return write_response(&mut stream, 400, "text/plain; charset=utf-8", "no-store", b"Bad request", false, false);
    };
    if method != "GET" && method != "HEAD" {
        return write_response(&mut stream, 405, "text/plain; charset=utf-8", "no-store", b"Method not allowed", false, method == "HEAD");
    }

    let head_only = method == "HEAD";
    if target == "/healthz" {
        return write_response(&mut stream, 200, "application/json; charset=utf-8", "no-store", b"{\"status\":\"ok\"}", false, head_only);
    }

    let Some(relative) = safe_relative_path(target) else {
        return write_response(&mut stream, 400, "text/plain; charset=utf-8", "no-store", b"Invalid path", false, head_only);
    };
    let candidate = root.join(relative);
    let file_path = if candidate.is_dir() {
        candidate.join("index.html")
    } else if candidate.is_file() {
        candidate
    } else if Path::new(target.split('?').next().unwrap_or(target)).extension().is_none() {
        root.join(relative).join("index.html")
    } else {
        PathBuf::new()
    };
    let (status, file_path) = if file_path.is_file() {
        (200, file_path)
    } else {
        (404, root.join("404.html"))
    };
    let Ok(file_path) = fs::canonicalize(file_path) else {
        return write_response(&mut stream, status, "text/plain; charset=utf-8", "no-store", b"Not found", false, head_only);
    };
    if !file_path.starts_with(root) || !file_path.is_file() {
        return write_response(&mut stream, status, "text/plain; charset=utf-8", "no-store", b"Not found", false, head_only);
    }

    let content_type = mime_type(&file_path);
    let cache_control = cache_policy(&file_path);
    let accepts_gzip = accepts_gzip(&request);
    let gzip_path = append_suffix(&file_path, ".gz");
    let (body_path, compressed) = if accepts_gzip && gzip_path.is_file() {
        (gzip_path, true)
    } else {
        (file_path, false)
    };
    let body_path = fs::canonicalize(body_path)?;
    if !body_path.starts_with(root) {
        return write_response(&mut stream, 404, "text/plain; charset=utf-8", "no-store", b"Not found", false, head_only);
    }
    let metadata = fs::metadata(&body_path)?;
    let modified = metadata.modified().unwrap_or(std::time::UNIX_EPOCH)
        .duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_nanos();
    let etag = format!("\"{:x}-{:x}-{}\"", metadata.len(), modified, if compressed { "gzip" } else { "identity" });
    if request_header(&request, "if-none-match").is_some_and(|value| value.split(',').any(|tag| tag.trim() == etag || tag.trim() == "*")) {
        return write_not_modified(&mut stream, cache_control, &etag);
    }
    write_file_response(&mut stream, status, content_type, cache_control, &body_path, metadata.len(), compressed, &etag, head_only)
}

fn request_header<'a>(request: &'a str, header_name: &str) -> Option<&'a str> {
    request.lines().skip(1).filter_map(|line| line.split_once(':'))
        .find(|(name, _)| name.trim().eq_ignore_ascii_case(header_name))
        .map(|(_, value)| value.trim())
}

fn accepts_gzip(request: &str) -> bool {
    let Some(value) = request_header(request, "accept-encoding") else { return false; };
    value.split(',').any(|encoding| {
        let mut parts = encoding.trim().split(';');
        let name = parts.next().unwrap_or("").trim();
        let quality = parts.find_map(|part| {
            let (key, value) = part.trim().split_once('=')?;
            key.trim().eq_ignore_ascii_case("q").then(|| value.trim().parse::<f32>().ok()).flatten()
        }).unwrap_or(1.0);
        name.eq_ignore_ascii_case("gzip") && quality > 0.0
    })
}

fn read_request(stream: &mut TcpStream) -> std::io::Result<Option<String>> {
    let mut bytes = Vec::with_capacity(2048);
    let mut chunk = [0_u8; 1024];
    loop {
        let count = stream.read(&mut chunk)?;
        if count == 0 {
            return Ok(None);
        }
        bytes.extend_from_slice(&chunk[..count]);
        if bytes.windows(4).any(|window| window == b"\r\n\r\n") {
            return Ok(Some(String::from_utf8_lossy(&bytes).into_owned()));
        }
        if bytes.len() > MAX_HEADER_BYTES {
            return Ok(Some(String::new()));
        }
    }
}

fn parse_request_line(line: &str) -> Option<(&str, &str)> {
    let mut parts = line.split_whitespace();
    let method = parts.next()?;
    let target = parts.next()?;
    if !target.starts_with('/') {
        return None;
    }
    Some((method, target))
}

fn safe_relative_path(target: &str) -> Option<PathBuf> {
    let path = target.split('?').next()?.split('#').next()?;
    let decoded = percent_decode(path)?;
    if decoded.contains('\\') || decoded.contains('\0') || decoded.contains(':') {
        return None;
    }
    let relative = decoded.trim_start_matches('/');
    let path = Path::new(relative);
    if path.components().any(|part| match part {
        Component::Normal(name) => name.to_string_lossy().starts_with('.'),
        Component::CurDir => false,
        _ => true,
    }) {
        return None;
    }
    Some(path.to_path_buf())
}

fn percent_decode(value: &str) -> Option<String> {
    let bytes = value.as_bytes();
    let mut decoded = Vec::with_capacity(bytes.len());
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == b'%' {
            let high = hex_value(*bytes.get(index + 1)?)?;
            let low = hex_value(*bytes.get(index + 2)?)?;
            decoded.push((high << 4) | low);
            index += 3;
        } else {
            decoded.push(bytes[index]);
            index += 1;
        }
    }
    String::from_utf8(decoded).ok()
}

fn hex_value(value: u8) -> Option<u8> {
    match value {
        b'0'..=b'9' => Some(value - b'0'),
        b'a'..=b'f' => Some(value - b'a' + 10),
        b'A'..=b'F' => Some(value - b'A' + 10),
        _ => None,
    }
}

fn mime_type(path: &Path) -> &'static str {
    match path.extension().and_then(|extension| extension.to_str()).unwrap_or("").to_ascii_lowercase().as_str() {
        "html" | "htm" => "text/html; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "js" | "mjs" => "text/javascript; charset=utf-8",
        "json" | "webmanifest" | "map" => "application/json; charset=utf-8",
        "svg" => "image/svg+xml",
        "xml" => "application/xml; charset=utf-8",
        "txt" => "text/plain; charset=utf-8",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "avif" => "image/avif",
        "ico" => "image/x-icon",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "ttf" => "font/ttf",
        "pdf" => "application/pdf",
        _ => "application/octet-stream",
    }
}

fn cache_policy(path: &Path) -> &'static str {
    let name = path.file_name().and_then(|name| name.to_str()).unwrap_or("");
    let path_text = path.to_string_lossy().replace('\\', "/");
    if path_text.contains("/assets/")
        || (name.starts_with("search-index-") && name.ends_with(".json"))
    {
        "public, max-age=31536000, immutable"
    } else if name.ends_with(".html") || name == "sw.js" || name == "precache-manifest.json" {
        "no-cache, max-age=0, must-revalidate"
    } else {
        "public, max-age=3600"
    }
}

fn append_suffix(path: &Path, suffix: &str) -> PathBuf {
    let mut name = path.as_os_str().to_os_string();
    name.push(suffix);
    PathBuf::from(name)
}

fn write_response(
    stream: &mut TcpStream,
    status: u16,
    content_type: &str,
    cache_control: &str,
    body: &[u8],
    gzip: bool,
    head_only: bool,
) -> std::io::Result<()> {
    let reason = match status {
        200 => "OK",
        400 => "Bad Request",
        404 => "Not Found",
        405 => "Method Not Allowed",
        _ => "Internal Server Error",
    };
    write!(
        stream,
        "HTTP/1.1 {status} {reason}\r\nContent-Type: {content_type}\r\nContent-Length: {}\r\nCache-Control: {cache_control}\r\nX-Content-Type-Options: nosniff\r\nReferrer-Policy: strict-origin-when-cross-origin\r\nConnection: close\r\n",
        body.len()
    )?;
    if gzip {
        stream.write_all(b"Content-Encoding: gzip\r\n")?;
    }
    stream.write_all(b"Vary: Accept-Encoding\r\n")?;
    stream.write_all(b"X-Frame-Options: DENY\r\nPermissions-Policy: camera=(), microphone=(), geolocation=()\r\n")?;
    stream.write_all(b"\r\n")?;
    if !head_only {
        stream.write_all(body)?;
    }
    stream.flush()
}

fn write_file_response(
    stream: &mut TcpStream,
    status: u16,
    content_type: &str,
    cache_control: &str,
    path: &Path,
    content_length: u64,
    gzip: bool,
    etag: &str,
    head_only: bool,
) -> std::io::Result<()> {
    let reason = if status == 200 { "OK" } else { "Not Found" };
    write!(stream,
        "HTTP/1.1 {status} {reason}\r\nContent-Type: {content_type}\r\nContent-Length: {content_length}\r\nCache-Control: {cache_control}\r\nETag: {etag}\r\nVary: Accept-Encoding\r\nX-Content-Type-Options: nosniff\r\nX-Frame-Options: DENY\r\nReferrer-Policy: strict-origin-when-cross-origin\r\nPermissions-Policy: camera=(), microphone=(), geolocation=()\r\nConnection: close\r\n")?;
    if gzip { stream.write_all(b"Content-Encoding: gzip\r\n")?; }
    stream.write_all(b"\r\n")?;
    if !head_only {
        let mut file = fs::File::open(path)?;
        copy(&mut file, stream)?;
    }
    stream.flush()
}

fn write_not_modified(stream: &mut TcpStream, cache_control: &str, etag: &str) -> std::io::Result<()> {
    write!(stream,
        "HTTP/1.1 304 Not Modified\r\nCache-Control: {cache_control}\r\nETag: {etag}\r\nVary: Accept-Encoding\r\nX-Content-Type-Options: nosniff\r\nX-Frame-Options: DENY\r\nReferrer-Policy: strict-origin-when-cross-origin\r\nPermissions-Policy: camera=(), microphone=(), geolocation=()\r\nConnection: close\r\n\r\n")?;
    stream.flush()
}
