---
sidebar_position: 3
---

import PlatformBadges from '@site/src/components/PlatformBadges';

# Commands

:::note
This page contains commonly useful Windows Command Prompt commands for troubleshooting, system maintenance, hardware information, and networking.

The descriptions and command behavior are based on the official [Microsoft Learn Windows Commands reference](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands).
:::

## Disk and file-system issues

[Microsoft Learn - `chkdsk`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/chkdsk)

```cmd
chkdsk /f
```

:::tip
**Why use `/f`?**  
The `/f` parameter tells `chkdsk` to fix logical file-system errors that it finds on the volume.
:::

<details>
<summary>Details</summary>

`chkdsk` checks the file system and file-system metadata of a volume for logical and physical errors.

When used without parameters, it only reports the current status of the volume. Parameters such as `/f`, `/r`, `/x`, and `/b` allow it to perform different repair operations.

For example:

```cmd
chkdsk C: /f
```

This checks the `C:` drive and attempts to fix logical file-system errors.

:::warning
`chkdsk` may need to schedule the check for the next restart if the volume is currently in use.
:::

</details>

---

[Microsoft Learn - `sfc`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/sfc)

```cmd
sfc /scannow
```

:::tip
**Why use `/scannow`?**  
The `/scannow` parameter scans all protected Windows system files and attempts to repair files that are corrupted or have been modified incorrectly.
:::

<details>
<summary>Details</summary>

`SFC` stands for **System File Checker**.

It scans and verifies the integrity of protected Windows system files. If it finds an incorrect or corrupted file, Windows attempts to replace it with the correct version from the Windows component store.

You can run:

```cmd
sfc /scannow
```

to perform a complete scan and repair.

:::warning
You normally need to run Command Prompt as an administrator when using `sfc`.
:::

</details>

---

[Microsoft Learn - `diskpart`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/diskpart)

```cmd
diskpart
```

<details>
<summary>Details</summary>

`diskpart` is a command-line tool for managing disks, partitions, volumes, and virtual hard disks.

Before most DiskPart commands can be used, you need to select an object and give it **focus**. Commands you enter will then operate on the object that currently has focus.

For example:

```cmd
diskpart
list disk
select disk 1
```

You can then use commands such as:

```cmd
list partition
list volume
detail disk
```

:::warning
DiskPart can make destructive changes to disks and partitions. Be careful when selecting disks and using commands such as `clean`, `delete`, and `format`.
:::

</details>

---

[Microsoft Learn - DISM](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/repair-a-windows-image)

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
```

<details>
<summary>Details</summary>

`DISM` (**Deployment Image Servicing and Management**) is used to service and repair Windows images.

The `/RestoreHealth` option scans the Windows component store for corruption and attempts to repair problems it finds.

For a quick check without performing a repair:

```cmd
DISM /Online /Cleanup-Image /CheckHealth
```

To perform a more thorough scan:

```cmd
DISM /Online /Cleanup-Image /ScanHealth
```

To repair the image:

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
```

Microsoft also recommends using `sfc /scannow` after DISM when troubleshooting Windows system-file corruption.

:::warning
DISM may use Windows Update as a repair source. If Windows Update cannot provide the required files, a different repair source may be required.
:::

</details>

## Network and connectivity issues

[Microsoft Learn - `ipconfig`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig)

```cmd
ipconfig
```

<details>
<summary>Details</summary>

`ipconfig` displays the current TCP/IP configuration of network adapters and can also be used to refresh DHCP and DNS information.

```cmd
ipconfig /all
```

Displays the full TCP/IP configuration for all network adapters.

Useful when you need to check information such as:

- IPv4 and IPv6 addresses
- Subnet masks
- Default gateways
- DNS servers
- DHCP information
- MAC addresses

```cmd
ipconfig /displaydns
```

Displays the contents of the local DNS resolver cache.

Useful when troubleshooting DNS problems or checking which DNS records Windows currently has cached.

```cmd
ipconfig /flushdns
```

Clears the local DNS resolver cache.

Useful when Windows is using outdated or incorrect DNS information.

```cmd
ipconfig /registerdns
```

Manually starts DNS registration for the computer.

Useful on networks that use dynamic DNS.

```cmd
ipconfig /release
```

Releases the current DHCP-assigned IPv4 configuration.

Useful when troubleshooting DHCP or IP-address problems.

```cmd
ipconfig /renew
```

Requests a new DHCP configuration.

Useful when a computer is having trouble obtaining or refreshing an IPv4 address.

```cmd
ipconfig /release6
```

Releases the current DHCPv6 configuration.

```cmd
ipconfig /renew6
```

Renews the DHCPv6 configuration.

```cmd
ipconfig /showclassid "Ethernet"
```

Displays the DHCP class ID configured for a network adapter.

```cmd
ipconfig /setclassid "Ethernet" TEST
```

Sets the DHCP class ID for a network adapter.

</details>

---

[Microsoft Learn - `netsh winsock`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netsh-winsock)

```cmd
netsh winsock reset
```

<details>
<summary>Details</summary>

`netsh winsock reset` resets the Winsock catalog to a clean state.

Winsock is responsible for providing applications with access to Windows networking services. A corrupted Winsock configuration can cause applications to lose network connectivity.

This command can be useful when troubleshooting persistent connection problems caused by corrupted Winsock settings.

:::warning
You normally need to restart Windows after resetting Winsock for the changes to take effect.
:::

</details>

---

[Microsoft Learn - `netsh`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netsh)

```cmd
netsh int ip reset
```

<details>
<summary>Details</summary>

This command resets the TCP/IP configuration back toward its default state.

It can be useful when troubleshooting network problems caused by corrupted or incorrect TCP/IP configuration.

For example:

```cmd
netsh int ip reset
```

You can also specify a log file:

```cmd
netsh int ip reset resetlog.txt
```

:::warning
`netsh` is still available, but Microsoft recommends using PowerShell for the most robust and up-to-date Windows networking automation.
:::

</details>

---

[Microsoft Learn - `ping`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ping)

```cmd
ping
```

<details>
<summary>Details</summary>

`ping` tests IP-level connectivity to another computer by sending ICMP echo requests and waiting for replies.

For example:

```cmd
ping 192.168.1.1
```

You can also test a hostname:

```cmd
ping example.com
```

If the IP address works but the hostname does not, the problem may be related to DNS or name resolution.

</details>

---

[Microsoft Learn - `nslookup`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nslookup)

```cmd
nslookup
```

<details>
<summary>Details</summary>

`nslookup` is used to diagnose DNS infrastructure and query DNS records.

For example:

```cmd
nslookup example.com
```

This can be useful when you want to check whether a hostname resolves correctly and which DNS server is responding.

You can also query a specific DNS server:

```cmd
nslookup example.com 1.1.1.1
```

</details>

---

[Microsoft Learn - `hostname`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/hostname)

```cmd
hostname
```

<details>
<summary>Details</summary>

Displays the host name of the computer.

For example:

```cmd
hostname
```

This is useful when you need to quickly find the computer's hostname from Command Prompt.

</details>

---

[Microsoft Learn - `tracert`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/tracert)

```cmd
tracert example.com
```

<details>
<summary>Details</summary>

`tracert` displays the path taken by network traffic to a destination.

It works by sending packets with progressively increasing TTL values and recording the routers encountered along the way.

For example:

```cmd
tracert example.com
```

This is useful when troubleshooting routing problems or finding where traffic stops responding.

</details>

---

[Microsoft Learn - `arp`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/arp)

```cmd
arp -a
```

<details>
<summary>Details</summary>

The `arp` command displays and modifies entries in the **Address Resolution Protocol (ARP)** cache.

The ARP cache contains mappings between IP addresses and physical network addresses such as MAC addresses.

To display the current ARP cache:

```cmd
arp -a
```

To delete an ARP entry:

```cmd
arp -d 192.168.1.10
```

To add a static ARP entry:

```cmd
arp -s 192.168.1.10 00-AA-00-4F-2A-9C
```

</details>

---

[Microsoft Learn - `systeminfo`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/systeminfo)

```cmd
systeminfo
```

<details>
<summary>Details</summary>

`systeminfo` displays detailed configuration information about a computer and its operating system.

It can display information such as:

- Windows version
- System manufacturer
- System model
- Processor
- Installed memory
- Network information
- Windows installation information

This makes it useful when gathering basic system information during troubleshooting.

You can also save the output in different formats:

```cmd
systeminfo /fo list
```

```cmd
systeminfo /fo csv
```

</details>

---

[Microsoft Learn - `netstat`](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netstat)

```cmd
netstat
```

<details>
<summary>Details</summary>

`netstat` displays active network connections and listening ports.

Without parameters, it displays active TCP connections.

To display listening ports and active connections:

```cmd
netstat -a
```

To display connections together with their process IDs:

```cmd
netstat -o
```

To display addresses and ports numerically:

```cmd
netstat -n
```

You can combine parameters:

```cmd
netstat -ano
```

This is particularly useful when investigating which ports are being used and which processes own network connections.

</details>

---

## Microsoft reference

The commands on this page are based on Microsoft's official Windows Command Prompt documentation.

**Full command reference:**

[Microsoft Learn - Windows Commands](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands)

Microsoft maintains the complete **Command-line reference A-Z** there, including commands that are not currently covered on this page.