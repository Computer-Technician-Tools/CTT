---
sidebar_position: 3
---

import PlatformBadges from '@site/src/components/PlatformBadges';
import SourceBadge from '@site/src/components/SourceBadge';

# Troubleshooting

## Android MMI Codes

MMI codes are combinations of numbers, asterisks, and hash symbols entered in the dialer to access device or network information. Availability varies by manufacturer, Android version, carrier, and region.

| Code | Function |
| --- | --- |
| `*#06#` | Display IMEI number |
| `*#07#` | Show SAR value |
| `*#*#4636#*#*` | Phone, battery, and usage information |
| `*#*#44336#*#*` | Software version and update information |
| `*#*#3264#*#*` | RAM information |
| `*#*#225#*#*` | Calendar data storage information |
| `*#*#426#*#*` | Google Play services diagnostic report |
| `*#*#197328640#*#*` | Service/testing mode |
| `*#*#2664#*#*` | Touchscreen test |
| `*#*#232331#*#*` | Bluetooth test |
| `*#*#232339#*#*` | Wi-Fi/WLAN test |
| `*#*#1575#*#*` | Full GPS test |
| `*#*#0842#*#*` | Vibration and backlight test |
| `*#0782#` | Clock test |

## Manufacturer-specific codes

| Manufacturer | Code | Function |
| --- | --- | --- |
| Samsung | `*#0*#` | Hardware diagnostic menu |
| Samsung | `*#0228#` | Battery status |
| Samsung | `*#1234#` | Software version and model details |
| Samsung | `*#011#` | Network details and serving-cell information |
| Samsung | `*#0283#` | Loopback test menu |
| Samsung | `*#0808#` | USB settings |
| Samsung | `*#2663#` | Advanced firmware menu |
| Samsung | `*#7353#` | Quick test menu |
| Samsung | `*#9090#` | Advanced debugging tools |
| Samsung | `*#9900#` | System dump mode |
| Samsung | `*#2683662#` | Advanced service mode |
| Samsung | `*#34971539#` | Camera firmware information |
| Huawei | `*#*#2846579#*#*` | Project menu |
| Huawei | `*#*#0000#*#*` | About phone |
| Huawei | `*#*#225#*#*` | Calendar information |
| Huawei | `*#*#426#*#*` | FCM diagnostics |
| Motorola | `*#*#2486#*#*` | Engineering mode |
| Motorola | `*#07#` | Regulatory information |
| Motorola | `##7764726` | Hidden menu (Motorola Droid) |
| OPPO / Realme | `*#800#` | Log function or diagnostic menu |
| OPPO / Realme | `*#899#` | Engineer mode |
| OPPO / Realme | `*#67#` | Call-forwarding check |
| OPPO / Realme | `*#*#7780#*#*` | Reset phone |
| OPPO / Realme | `*#*#2664#*#*` | Screen test |
| OPPO / Realme | `*#*#3264#*#*` | RAM information |
| OPPO / Realme | `*#888#` | PCB version information |
| OPPO / Realme | `*#6776#` | Display software version/device information |
| Xiaomi | `*#*#64663#*#*` | Hardware diagnostic and quality-check menu |
| Xiaomi | `*#*#86583#*#*` | Enable VoLTE carrier check |
| Xiaomi | `*#*#86943#*#*` | Enable VoWiFi carrier check |
| Xiaomi | `*#*#726633#*#*` | Enable/disable 5G SA carrier check |
| OnePlus | `*#66#` | IMEI and MEID (encrypted) |
| OnePlus | `*#888#` | PCB motherboard version |
| OnePlus | `*#1234#` | Software version |
| OnePlus | `*#*#2947322243#*#*` | Wipes internal memory |
| OnePlus | `*#*#197328640#*#*` | Service mode |
| Nothing Phone | `*#*#682#*#*` | Offline update tool |

> Some service codes can change device settings or erase data. Check the exact device documentation before using a code that changes system state.

## GSM / USSD / MMI Codes

GSM is a cellular communication standard. USSD is a live text-based session with a carrier; codes normally begin with `*` and end with `#`. Carrier support and dialing formats vary.

### Call forwarding

| Code | Function |
| --- | --- |
| `**21*(number)#` | Activate unconditional forwarding |
| `##21#` | Deactivate unconditional forwarding |
| `*#21#` | Check unconditional forwarding status |
| `**61*(number)**(seconds)#` | Forward when no answer |
| `##61#` | Deactivate no-answer forwarding |
| `*#61#` | Check no-answer forwarding status |
| `**67*(number)#` | Forward when busy |
| `##67#` | Deactivate busy forwarding |
| `*#67#` | Check busy forwarding status |
| `**62*(number)#` | Forward when unreachable |
| `##62#` | Deactivate unreachable forwarding |
| `*#62#` | Check unreachable forwarding status |
| `##002#` | Cancel all forwarding rules |
| `##004#` | Cancel all conditional forwarding |

### Call waiting and caller ID

| Code | Function |
| --- | --- |
| `*43#` | Activate call waiting |
| `#43#` | Deactivate call waiting |
| `*#43#` | Check call-waiting status |
| `#31#(number)` | Hide number for the next call |
| `*31#(number)` | Show number for the next call |
| `*#31#` | Check caller-ID restriction status |
| `*#30#` | Check incoming caller-ID status |
| `*#76#` | Check connected-line presentation status |
| `*#77#` | Check connected-line restriction status |

### Call barring

| Code | Function |
| --- | --- |
| `**33*(PIN)#` | Bar all outgoing calls |
| `##33*(PIN)#` | Remove outgoing-call barring |
| `*#33#` | Check outgoing-call barring status |
| `**331*(PIN)#` | Bar all outgoing international calls |
| `##331*(PIN)#` | Remove international-call barring |
| `**35*(PIN)#` | Bar all incoming calls |
| `##35*(PIN)#` | Remove incoming-call barring |
| `*#35#` | Check incoming-call barring status |
| `**351*(PIN)#` | Bar incoming calls while roaming |
| `##330*(PIN)#` | Remove all call barring |

### Phone and network information

| Code | Function |
| --- | --- |
| `*#06#` | Show IMEI number |
| `*#07#` | Show SAR information |
| `*#*#4636#*#*` | Android phone and network information |

### Voicemail

| Code | Function |
| --- | --- |
| `**004*(number)#` | Set all conditional forwarding to a number |
| `##004#` | Remove all conditional forwarding |

> Do not use codes that reset user data or alter call-barring settings without the owner’s authorization and carrier confirmation.
