---
sidebar_position: 5
---

import PlatformBadges from '@site/src/components/PlatformBadges';
import SourceBadge from '@site/src/components/SourceBadge';

# Troubleshooting

## Hide System Reserved
How to hide System Reserved from showing below.


<a href="/img/assets/windows/system-reserved.png"><img src="/img/assets/windows/system-reserved.png" alt="System Reserved Partition" /></a>


1. Open the **`Disk Management`** 

:::info
If you can't find the **Disk Management**, Press **`Windows Key & R`** and then use this command below, this command will open the **Disk Management** window.

```
diskmgmt.msc
```
:::

2. Select the **System Reserved** partition, Right click and then **`Change Drive Letter and Paths for System Reserved`** select the letter for example **`Z:`**, and then **`Remove`**, then **`Yes` > `Yes`** this will remove the **System Reserved** partition letter.

:::note
This will remove the partition letter and it will not show up any more on your file explorer.
:::

## Time/Clock Synchronization

Things you may try to fix this issue.

### Restart and Configure the Windows Time Service

1. Open the Run using Windows + R or just search Run or just Right Click on Windows icon and open the Run.
2. Write **`services.msc`** or just search **Services** on the search bar.
3. Scroll down until you find the **`Windows Time`** right click and restart, if this not work then just start it and then restart the service.
4. If that didn't work right click on **`Windows Time`** and then select **Properties** then Startup Type: select **Automatic** if it is running already just press top and restart. then click apply.
5. go to **Log On**, and Select **Local System Account** and **Allow service to interact with desktop**

### Change the time server

1. Open the Run using **Windows Key + R** or just search **Run** or just **Right Click** on **Windows** icon and open the **Run**.
2. Write **`timedate.cpl`** then press **Ok** or **Enter**.
3. Select **Internet Time**, Change Settings...
4. Change Server, and Update now.

### Add more Servers to the list

1. Open the Run using Windows Key + R or just search Run or just Right Click on Windows icon and open the Run.
2. Write **`regedit`** then press Ok or Enter.
3. On the top bar just Paste this **`Computer\HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\CurrentVersion\DateTime\Servers`**
4. Right click on the left tab and **New** > **String Value** name it the next number (if it is 2 then name it 3.) Double click on the String value you made and renamed, and on **Value Data** add **`pool.ntp.org`** then press okay, i will give you more servers. **`isc.org`** now the new servers will show up at Date and Time as we used before at Change the time server, you have to run the **`timedate.cpl`**

> Servers List -> [Servers](https://gist.github.com/mutin-sa/eea1c396b1e610a2da1e5550d94b0453)

### Force Windows to Sync Time

1. Open the **Command Prompt/CMD** as an **Administrator** and paste those commands from below one at the time.

> [w32time](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/ff799054(v=ws.11)) Syntax and parameters

```
net stop w32time
```
> It stops the Windows Time Service

```
w32tm /unregister
```

> Unregisters the time service, and removes all configuration information from the registry.

```
w32tm /register
```

> Registers the time service to run as a service, and adds default configuration to the registry.

```
net start w32time
```

> It starts the Windows Time Service

```
w32tm /resync
```

> It tells a computer that it should resynchronize its clock as soon as possible, throwing out all accumulated error statistics.

```
shutdown /r /t 0
```

:::warning
this command will restart your computer
:::

### Check the Current Windows Time Source

1. Open the **CMD** as an **Administrator**.

2. Then run:

```
w32tm /query /source
```

3. Then check the current peers:

```
w32tm /query /peers
```

4. You can also check the current Windows Time status:

```
w32tm /query /status
```

This can help you see where Windows is trying to get its time from and whether the time service is actually communicating with a time source.

### Force Windows to Rediscover the Time Source

If a normal resync did not work, try:

```
w32tm /resync /rediscover
```

This makes Windows rediscover its network time sources and then try to synchronize again.

### Test the Time Server

You can test a time server without changing the Windows Time configuration by using:

```text
w32tm /stripchart /computer:pool.ntp.org /dataonly /samples:5
```

You can replace **`pool.ntp.org`** with another time server from your list.

If the requests time out or no usable response is returned, the problem may be the time server, DNS, the network, or UDP port 123.

### Check DNS

If you are using a server name such as **`pool.ntp.org`**, make sure Windows can resolve it.

1. Open CMD.

2. Then run:

```
nslookup pool.ntp.org
```

3. If it cannot resolve the server, try another DNS server or fix the DNS/network problem first.

### Check UDP Port 123 / Firewall

Windows Time uses NTP over **UDP port 123**.

If Windows is sending requests but receiving no response, a Windows Firewall, router, security appliance, VPN, or another firewall may be blocking UDP port 123.

You may need to check the firewall/network configuration and make sure NTP traffic is allowed.

### Try Another Network

If all the time servers are failing, try connecting the computer to another network, such as a phone hotspot.

If time synchronization works on another network, the original network, firewall, router, VPN, or DNS configuration may be causing the problem.

### Restart the Computer

If you have already restarted the Windows Time service and tried the commands above, restart Windows and try the synchronization again.

Sometimes a restart is enough to clear a service or network problem.

### Check the Date, Time, and Time Zone

Make sure the time zone is correct.

1. Open **Settings**.
2. Go to **Time & language** > **Date & time**.
3. Check the **Time zone**.
4. Check that **Set time automatically** is enabled when you want Windows to synchronize the time automatically.

### Check the CMOS Battery

If the computer keeps losing the date and time, especially after the computer has been completely powered off, check the **CMOS/RTC battery**.

A weak or dead CMOS battery can cause the hardware clock to lose its stored time when the computer is powered off.

You may notice things such as:

- The date and time reset after the PC has been unplugged or powered off.
- The BIOS/UEFI clock is also wrong.
- The computer keeps asking for the date/time or showing other BIOS clock-related problems.

If all of the Windows Time, NTP server, DNS, network, and synchronization methods above have been tried and the clock is still resetting after the computer is powered off, the **CMOS battery may be dead and may need to be replaced**.

:::warning
If the time is only wrong while Windows is running but the BIOS/UEFI clock remains correct after a full power-off, the CMOS battery is not necessarily the problem. Check the Windows Time service, NTP configuration, DNS, firewall, and network first.
:::