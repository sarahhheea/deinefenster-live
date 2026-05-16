# Shop-Migration: material + glasart Felder

**Datum:** 2026-05-16  
**Inserate gesamt:** 148  
**Geänderte Inserate:** 123  
**Backup:** `data/shop-produkte.json.bak` (kannst du wiederherstellen falls was falsch ist)

## Heuristik
- `material` aus Titel/Kategorie: "Holz*" → holz, "Alu*/Aluminium*" → aluminium, sonst kunststoff
- `glasart` aus Eigenschaften/Titel: chinchilla / milchglas / sicherheitsglas / schallschutzglas, sonst klarglas
- Bei Zweifel: Default kunststoff + klarglas (konservativ)

## Änderungs-Liste
| Standnr. | Titel | Kategorie | Material | Glasart |
|---|---|---|---|---|
| 405 | 2 Flügel gebraucht Ornament Glas 1680 x 1410 Nr.405 | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 2300 | Festelement weiß 2 Fach Glas in den breiten 1000 mm | festelement | kunststoff ✏ | klarglas ✏ |
| 2700 | Festelement 2 Fach Glas weiß in den breiten 900 mm | festelement | kunststoff ✏ | klarglas ✏ |
| 2701 | 2 Flügel Fenster mit elektrischen Rollladen weiß 2 Fach | fenster-2fluegel-rollo | kunststoff ✏ | klarglas ✏ |
| 2501 | 2 Flügel Fenster Rollladen Gurtwickler weiß 2Fach Glas  | fenster-2fluegel-rollo | kunststoff ✏ | klarglas ✏ |
| 2104 A | 1 Flügel Fenster mit Rollladen innen weiß außen Anthraz | fenster-1fluegel-rollo | kunststoff ✏ | klarglas ✏ |
| 2102 A | 2 Flügel Fenster innen weiß außen Anthrazit 3 Fach Glas | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 2010 | 2 Flügel Fenster innen weiß außen Anthrazit 2 Fach Glas | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 2101 A | 1 Flügel Fenster innen weiß außen Anthrazit 3 Fach Glas | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 2011 Halle | 1 Flügel Fenster 2 Fach Glas innen weiß  außen Anthrazi | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| B4W Halle | Festelement weiß 2 Fach Glas in den Breiten 2000 mm | festelement | kunststoff ✏ | klarglas ✏ |
| Hinter Büro | 1 Flügel Fenster  weiß 2 Fach Glas in den  Breiten 1050 | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| Hinter Büro | 1 Flügel Fenster weiß  2 Fach Glas  in den  breiten 950 | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| Unter der Rampe | 1 Flügel Fenster weiß 2 Fach Glas in den breiten 1300 m | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| Rampe | 1 Flügel Fenster weiß 2 Fach Glas in den breiten 1100 m | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| Unter der Rampe | 1 Flügel Fenster 2 Fach Glas weiß in den breiten 1200 m | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| E4 | 1 Flügel Balkontür Rollladen Gurtwickler 2 fach Gas wei | balkontuer-1fluegel-rollo | kunststoff ✏ | klarglas ✏ |
| Rampe oben und unten | 1 Flügel Fenster weiß 2 Fach Glas in den Breiten 1000 m | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| Rampe | 1 Flügel Balkontür umlaufender Rahmen 2 Fach Glas weiß  | balkontuer-1fluegel | kunststoff | klarglas ✏ |
| Rampe | 1 Flügel Balkontür Rollladen Gurtwickler weiß  2 Fach G | balkontuer-1fluegel-rollo | kunststoff ✏ | klarglas ✏ |
| 5001 | 1 Flügel Fenster mit elektrischen Rollladen  weiß 2 Fac | fenster-1fluegel-rollo | kunststoff ✏ | klarglas ✏ |
| 5001 | 1 Flügel Fenster mit Rollladen Gurtwickler  2 Fach Glas | fenster-1fluegel-rollo | kunststoff ✏ | klarglas ✏ |
| 2401 | 2 Flügel Fenster mit elektrischen Rollladen weiß 2 Fach | fenster-2fluegel-rollo | kunststoff ✏ | klarglas ✏ |
| 2301 | 2 Flügel Fenster mit Rollladen Gurtwickler  2 Fach Glas | fenster-2fluegel-rollo | kunststoff ✏ | klarglas ✏ |
| 6020 | 2 Flügel Balkontür weiß  2 Fach Glas Stulp Aluschwelle  | balkontuer-2fluegel | kunststoff ✏ | klarglas ✏ |
| 6030 | 2 Flügel  Balkontür weiß  2 Fach Glas Stulp Aluschwelle | balkontuer-2fluegel | kunststoff ✏ | klarglas ✏ |
| 6040 | 2 Flügel Balkontür weiß 2 Fach Glas Stulp umlaufender R | balkontuer-2fluegel | kunststoff ✏ | klarglas ✏ |
| 11000 | 1 Flügel Fenster Farbe weiß 2 Fach Glas in den Breiten  | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 11000 | 1 Flügel Fenster Farbe weiß 2 Fach Glas in den Breiten  | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 11000 | 1 Flügel Fenster Farbe weiß 2 Fach Glas  in den Breiten | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 4301 | 1 Flügel Fenster mit elektrischen Rollladen weiß  2 Fac | fenster-1fluegel-rollo | kunststoff ✏ | klarglas ✏ |
| 4301 B | 1 Flügel Fenster mit Rollladen Gurtwickler weiß  2 Fach | fenster-1fluegel-rollo | kunststoff ✏ | klarglas ✏ |
| 2201 A | 2 Flügel Fenster mit elektrischen Rollladen 2 Fach Glas | fenster-2fluegel-rollo | kunststoff ✏ | klarglas ✏ |
| 2201 | 2 Flügel Fenster Rollladen 2 Fach Glas Gurtwickler in d | fenster-2fluegel-rollo | kunststoff ✏ | klarglas ✏ |
| 4001 C | 2 Flügel Fenster 2 Fach Glas Pfosten in den Höhen 1500  | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 4001 B | 2 Flügel Fenster 2 Fach Glas Pfosten in den Höhen 1350  | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 4001 A | 2 Flügel Fenster 2 Fach Glas Pfosten in den Höhen 1200  | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 4001 | 2 Flügel Fenster Pfosten 2 Fach  Glas in den Höhen 1000 | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 6053 | Balkontür abschließbar Barrierefrei/ Aluschwelle 2 Fach | balkontuer-1fluegel | kunststoff ✏ | klarglas ✏ |
| 6052 | Balkontür 1 Flügel mit Aluschwelle/ Barrierefrei  2 Fac | balkontuer-1fluegel | kunststoff ✏ | klarglas ✏ |
| 6051 | Balkontür 1 Flügel 2 Fach Glas  umlaufender Rahmen Nr.  | balkontuer-1fluegel | kunststoff ✏ | klarglas ✏ |
| 4301 A | 1 Flügel Fenster mit elektrischen Rollladen weiß 2 Fach | fenster-1fluegel-rollo | kunststoff ✏ | klarglas ✏ |
| 4301 | 1 Flügel Fenster  Rollladen mit Gurtwickler  weiß 2 Fac | fenster-1fluegel-rollo | kunststoff ✏ | klarglas ✏ |
| 0001 A | 2 Flügel Fenster  gebraucht 2480 x 1330 Fenster mit Lüf | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0003 A | 2 Flügel Fenster gebraucht groß 2480 x 1370 Kunststofff | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0004A | 1 Flügel Fenster gebraucht groß 1270x1370 Nr. 0004 A | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0002 A | 2 Flügel Fenster gebraucht  1900 x 1400 Kunststofffenst | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0008A | 2 Flügel Fenster gebraucht klein 1600x1525 Nr. 0008 A | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0006 A | 1 Flügel Fenster gebraucht 1270 x 1370  mit Lüfter nur  | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0009 A | 3 Flügel Fenster gebraucht ca. 2550 x 1490 Nr. 0009 A | fenster-3fluegel | kunststoff ✏ | klarglas ✏ |
| 0001B | 2 Flügel Fenster gebraucht 1725x1360 Nr.0001 B | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0002B | 2 Flügel Fenster gebraucht klein 1550x1230 Nr.0002 B | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0003B | 1 Flügel Fenster gebraucht DIN Rechts 1075x1360 Nr. 000 | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0004B | 2 Flügel Fenster gebraucht 1700x1360 Nr. 0004 B | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0005B | 1 Flügel Fenster gebraucht DIN Rechts 1080x1360 Nr. 000 | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0006 B | 2 Flügel Fenster gebraucht klein Kunststofffenster 1700 | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0011 B | 1 Flügel Fenster gebraucht DIN Rechts Kunststofffenster | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0010 B | 1 Flügel Fenster gebraucht ca. 1120x1360 Nr. 0010 B | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0013 B | 2 Flügel Fenster gebraucht ca. 1690x1360 Nr. 0013 B | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0015 B | 1 Flügel Fenster gebraucht DIN Rechts 1120x1360 Nr. 001 | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0020 B | 1 Flügel Fenster gebraucht  DIN Links Kunststofffenster | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0022 B | 2 Flügel Fenster gebraucht 2150x1340 Nr. 0022 B | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0024 B | 1 Flügel Fenster gebraucht DIN Links Kunststoff Fenster | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0027 B | 2 Flügel Fenster gebraucht ca 1810x1500 Nr.0027 B | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0029 B | 2 Flügel Fenster gebraucht verschmutzt 2320 x 1360  Nr. | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0034 B | 2 Flügel Fenster gebraucht Kunststofffenster weiß 2150  | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0035 B | 2 Flügel Fenster gebraucht 2140x1360 Nr. 0035 B | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0038 B | 2 Flügel Fenster gebraucht Kunststofffenster Weiß 2150  | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0042 B | 2 Flügel Fenster gebraucht Kunststofffenster 1795 x 140 | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0044 B | 1 Flügel Fenster gebraucht Kunststofffenster  DIN Recht | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0046 B | 2 Flügel Fenster gebraucht Kunststofffenster 1680 x 123 | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0047 B | 1 Flügel Fenster gebraucht ca. 1185x1340 Nr. 0047 B | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0050 B | 2 Flügel Fenster gebraucht Schallschutz sehr schwer Kun | fenster-2fluegel | kunststoff ✏ | schallschutzglas ✏ |
| 0049 B | 1 Flügel Fenster gebraucht ca. 1250 x 1340 Kunststoff F | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0043 B | 1 Flügel Fenster gebraucht DIN Links 900x1395 Nr. 0043  |  | kunststoff ✏ | klarglas ✏ |
| 0032 B | 2 Flügel Fenster gebraucht ca. 1850 x 1370 Standort Kun | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0301 C | 2 Flügel Fenster gebraucht Sprossen  Stulp mit Oberlich | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0302 C | 2 Flügel Fenster gebraucht Sprossen Kunststofffenster W | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0301 B | 1 Flügel Fenster gebraucht mit festem  Unterlicht 1470  | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0301 A | 1 Flügel Fenster gebraucht DIN Links Kunststofffenster  | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0302 A | 1 Flügel Fenster gebraucht DIN Rechts Kunststofffenster | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0303 A | 1 Flügel Fenster gebraucht  Schmal DIN Links  740 x 144 | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0016 A | 1 Flügel Fenster gebraucht Kunststofffenster 1170 x 170 | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0014 A | Balkontür 1 Flügel gebrauchte Kunststoff Tür  1050 x 21 | balkontuer-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0018 A | 1 Flügel Fenster gebraucht mit Unterlicht 1060 x 1870 S | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0019 A | 2 Flügel Fenster gebraucht Kunststofffenster  1500 x 17 | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0013/1 A | 3 Flügel Fenster gebraucht  2560 x 1500 Standort Nr 001 | fenster-3fluegel | kunststoff ✏ | klarglas ✏ |
| 0028 B | 2 Flügel Fenster gebraucht kaufen  1930 x 1360 Standort | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0210 E | 2 Flügel gebraucht Fenster kaufen 1600 x 1320 Standort  | fenster-3fluegel | kunststoff ✏ | klarglas ✏ |
| 0210 A | 3 Flügler Fenster kaufen gebraucht kaufen 2200 x 1320 N | fenster-3fluegel | kunststoff | klarglas ✏ |
| 0215 | EXPORT 1 Flügel Fenster schmal 760 x 1520 DIN vorrätig  | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0217 | 1 Flügel gebraucht Fenster kaufen Kunststoffenster 1220 | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0304 A | Balkontür kaufen 1 Flügel gebraucht 990 x 2150 Standort | balkontuer-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0311 A | Balkontür 1 Flügel gebraucht DIN Links 1000x2300 Nr. 03 | balkontuer-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0311/1 A | Balkontür 1 Flügel gebraucht mit Kämpfer  DIN Rechts 10 | balkontuer-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0312 A | 2 Flügel Fenster gebraucht 1870 x 1345 Fenster kaufen N | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0313 A | Einzelstück  3 Flügel Fenster gebraucht Oberlicht 1700x | fenster-3fluegel | kunststoff ✏ | klarglas ✏ |
| 0315 A | Balkontür 1 Flügel gebraucht DIN Rechts Außen 690x2200  | balkontuer-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0318 A | 2 Flügel Fenster gebraucht kaufen 1925 x 1270 Standort  | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0319 A | Balkontür 1 Flügel gebraucht 920x2150 DIN Links Nr.0319 | balkontuer-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0320 A | 2 Flügel Fenster gebraucht Kaufen 1780x1360 Standort Nr | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0325 A | 1 Flügel Fenster Sprossen DIN Rechts 1090x1590 Nr. 0325 | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0326 A | EINZELSTÜCK 2 Flügel Fenster gebraucht 1370x1570 Nr. 03 | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0327 A | 1 Flügel Fenster gebraucht kaufen 900 x 1440  Standort  | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0328 A | EINZELSTÜCK 1 Flügel Fenster gebraucht  Sprossen 975 x  | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0329 A | Einzelstück 2 Flügel mit Sprosse 1555 x 1340 Nr. 0329 A | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0330 A | Einzelstück 2 Flügel Fenster gebraucht Sprosse  Oberlic | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0338 A | Einzelstück 2 Flügel Fenster gebraucht Sprosse 1500 x 1 | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0305 B | 1 Flügel Fenster gebraucht DIN Rechts und Links  1280 x | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0306 B | 2 Flügel Fenster gebraucht kaufen 1650 x 1490 Nr. 0306  | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0307 B | 2 Flügel Fenster kaufen gebraucht 1680 x 1520 Nr. 0307  | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0308 B | 1 Flügel Fenster gebraucht 1150x1430 Nr. 0308 B |  | kunststoff ✏ | klarglas ✏ |
| 0313 B | 2 Flügel Fenster gebraucht 1920x1400  Nr. 0313 B | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0314 B | Balkontür 1 Flügel 840 x2190 DIN Links Nr. 0314 B | balkontuer-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0315 B | 2 Flügel Fenster kauen gebraucht 1920 x 1270 Standort N | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0322 B | 1 Flügel Fenster gebraucht Sprossen 680 x 1550 Standort | fenster-1fluegel | kunststoff ✏ | klarglas ✏ |
| 0303 C | 4 Flügel Fenster gebraucht Sprossen  2440x1750 Nr.0303  | fenster-4fluegel | kunststoff | klarglas ✏ |
| 0305 C | 2 Flügel Unterlicht gebraucht 3 Fach Glas 1620x2040 Nr. | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0309 C | 2 Flügel Fenster gebraucht 1670x1510 Nr. 0309 C | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0313 C | 3 Flügel Fenster Oberlicht gebraucht 1730x1790 nr. 0313 | fenster-3fluegel | kunststoff ✏ | klarglas ✏ |
| 0311 C | 2 Flügel Fenster Unterlicht gebraucht 2070x1960 Nr. 031 |  | kunststoff ✏ | klarglas ✏ |
| 0314 C | 2 Flügel Fenster gebraucht 1950x1405 Nr. 0314 C | fenster-2fluegel | kunststoff ✏ | klarglas ✏ |
| 0320 C | 3 Flügel Fenster gebraucht Sprossen 2070x1580 Nr. 0320  | fenster-3fluegel | kunststoff ✏ | klarglas ✏ |