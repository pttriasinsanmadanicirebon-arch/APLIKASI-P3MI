/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CPMI, Transaction, ProcessStatus, TransactionCategory } from "../types";

// Raw CPMI text lines directly from the user's request
export const RAW_CPMI_DATA = `1 TSEX 6440 AMELIA KONAAH FLIGHT PA Irwan
2 TS 6317 WANTIAH Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT Pa Hj Nono
3 TS 6274 LUGI YANTI Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT Bu Maskinah
4 TSEX 6342 ARISKA Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT PA Irwan
5 TSEX 6343 YENI BT SAEDI MARKUM Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT PA Irwan
6 TS 6273 MUSOBBIHAH Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT BU Gian
7 TS 6438 NAURA PARASA JANA Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT PA Uci
8 TS 6439 ALPI FLIGHT Bu Maskinah
9 TS 6272 JUWARIYAH Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT BU Gian
10 TS 6358 DEDE TRIANA PUTRI SUBANDI Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT PA Suryanto
12 TS 6286 SEPTI HERDIYANTI Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT PA Uci
14 TS 6290 MESI ARNENGSIH Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT Bu Maskinah
17 TS 6469 IGA YANTI Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT Bu Yatni
18 TS 6242 KHIYAROTUL LAILI Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT PA Suryanto
19 TS 6243 YUNITA Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI BNSP/BLK PA SUPANDI
27 TS 6344 KARTIKA PUJI LESTARI Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT PA Rosadi
28 TS 6289 RATIH PURNAMASARI Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT Bu Maskinah
30 TS 6480 AAT ATIKAH Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT PA Suryanto
31 TS 6287 YUYUN KOMARIYAH Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT Bu Yatni
34 TS 6300 SRI WAHYUNI Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI PROCESS PA Suryanto
35 TS 6301 WINDI AULIA Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT PA Suryanto
37 TS 6359 NYI MAS EVA Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT PA Suryanto
38 TSEX 6360 RANDINI HEDYAPURI Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT PA Kiki
45 TS 6516 EPI NURHIKMAH FLIGHT BU PONI
70 TS 6628 NAFLA FILANA FLIGHT bapa musa
72 TS 6658 SITI MARIYAULFAH FLIGHT bu Yatni
73 TS 6656 SITI AISYAH FLIGHT bu Yatni
74 TS 6659 MAYA SALSABILA FLIGHT bu Yatni
75 TS 6695 MELDA SAPITRI BNSP/BLK PA IBNU
76 TS 6701 KHODIJAH FLIGHT BU YATNI
78 TS 6757 KADINI BNSP/BLK PA IBNU
79 TS 6758 NURSANGADAH FINAL STAGE PA IBNU
80 TS 6759 EVA RAHDIYANTI FLIGHT PA SARIMAN
81 TS 6765 RINA FLIGHT BU GIAN
82 TS 6766 DIMA FEBRIYANTI FLIGHT PA TONI
83 TS 6779 ROFIQOH FLIGHT PA WAHYU
84 TS 6782 ETIN SUPRIATIN FLIGHT BU IRAT
85 TS 6783 YULIYANI BNSP/BLK BU GIAN
86 TS 6816 MAENI BNSP/BLK BU ROFIKO
87 TS 6790 NURHAYATI FLIGHT BU YATNI
89 TS 6793 NADIA INDRIYANI FLIGHT BU KUS
93 TS 6821 NUR EKA SAFITRI FINAL STAGE BU YATNI
95 TS 6832 NENENG FINAL STAGE BU YATNI
96 TS 6833 KAMELIYAH FLIGHT PA MARTONO
97 TS 6853 ANISYA ANGGIE AULIA FLIGHT BU KUS
98 TSEX 6855 LILI FARIDA FLIGHT BU YATNI
99 TS 6863 NIA LUSIYANTI FLIGHT BU MIMI
101 TS 6897 SITI NURLELA BNSP/BLK BU KUS
102 TS 6901 FLORA ABELIA VERIF ID MAS HASAN BU KUS
103 TS 6910 NENGSIH FLIGHT Pa imron gian
104 TS 6916 NAISYAH SAPITRI FINAL STAGE Bu Mini
105 TS 6920 NOVA ELYANAH PUTRI FINAL STAGE Pa kasirun`;

// Raw financial transactions directly from the user's request
export const RAW_TRANSACTIONS_DATA = `26/02/2025 Fee Sponsor TS6701 Khodijah Rp2.500.000
26/02/2025 Biaya MD TS6296 Riska Nur Indah Rp1.000.000
26/02/2025 ID Paspor TS6701 Khodijah Rp1.000.000
10/03/2025 Fee Sponsor TS6659 Maya Salsabela Rp2.500.000
10/03/2025 Biaya MD TS6296 Riska Nur Indah Rp450.000
10/03/2025 Biaya MD TS6357 Gina Apriyani Rp550.000
10/03/2025 ID Paspor TS6659 Maya Salsabela Rp1.000.000
21/03/2025 Living Cost TS6659 Maya Salsabela Rp2.350.000
21/03/2025 Living Cost TS6701 Khodijah Rp2.700.000
21/03/2025 Transport TS6701 Khodijah Rp500.000
21/03/2025 Transport TS6659 Maya Salsabela Rp500.000
17/04/2025 Fee Sponsor TS6757 Kadini Rp1.000.000
17/04/2025 Fee Sponsor TS6758 Nursangadah Rp1.000.000
17/04/2025 Biaya MD TS6357 Gina Apriyani Rp75.000
17/04/2025 Biaya MD TS6467 Gita Wahyuni Rp480.000
22/04/2025 Mcu Pra TS6757 Kadini Rp275.000
22/04/2025 Mcu Pra TS6758 Nursangadah Rp275.000
23/04/2025 Mcu Pra TS6759 Eva Rahdiyanti Rp275.000
23/04/2025 Mcu Pra TS6765 Rina Rp275.000
23/04/2025 Mcu Pra TS6766 Dima Febrianti Rp275.000
23/04/2025 Fee Sponsor TS6765 Rina Rp1.000.000
23/04/2025 Fee Sponsor TS6766 Dima Febrianti Rp1.000.000
02/05/2025 Fee Sponsor TS6759 Eva Rahdiyanti Rp1.000.000
02/05/2025 Fee Sponsor TS6779 Rofiqoh Rp1.000.000
02/05/2025 Living Cost TS6766 Dima Febrianti Rp1.000.000
02/05/2025 Living Cost TS6779 Rofiqoh Rp1.000.000
02/05/2025 Mcu Pra TS6779 Rofiqoh Rp275.000
08/05/2025 Mcu Pra TS6782 Etin Supriatin Rp275.000
08/05/2025 Mcu Pra TS6783 Yuliyani Rp275.000
08/05/2025 Living Cost TS6695 Melda Sapitri Rp1.850.000
13/05/2025 Fee Sponsor TS6782 Etin Supriatin Rp1.000.000
13/05/2025 Fee Sponsor TS6783 Yuliyani Rp1.000.000
13/05/2025 Fee Sponsor TS6695 Melda Sapitri Rp1.000.000
13/05/2025 Fee Sponsor TS6659 Maya Salsabela Rp2.500.000
13/05/2025 Fee Sponsor TS6701 Khodijah Rp2.500.000
13/05/2025 Biaya MD TS6229 Nela Yuliyanti Rp2.275.000
20/05/2025 Mcu Pra TS6790 Nurhayati Rp275.000
20/05/2025 ID Paspor TS6779 Rofiqoh Rp1.000.000
22/05/2025 Keterangan Lain Pak Edy Biaya Kepengurusan Izin cabang Rp1.400.000
23/05/2025 ID Paspor TS6779 Rofiqoh Rp200.000
23/05/2025 Mcu Pra TS 6793 NADIA INDRIYANI Rp275.000
23/05/2025 Mcu Pra TS 6794 KARTINI Rp275.000
23/05/2025 Fee Sponsor TS 6790 NURHAYATI Rp1.000.000
27/05/2025 Fee Sponsor TS 6794 KARTINI Rp1.000.000
27/05/2025 Living Cost TS6782 Etin Supriatin Rp1.000.000
27/05/2025 Living Cost TS6790 Nurhayati Rp1.000.000
27/05/2025 Living Cost TS 6798 ALIES FITRIA Rp1.000.000
27/05/2025 Living Cost TS 6793 NADIA INDRIYANI Rp1.000.000
27/05/2025 Royalti TS6659 Maya Salsabela Rp750.000
28/05/2025 Fee Sponsor TS6757 Kadini Rp1.000.000
28/05/2025 Fee Sponsor TS6779 Rofiqoh Rp1.500.000
28/05/2025 Fee Sponsor TS6793 NADIA INDRIYANI Rp1.000.000
28/05/2025 Fee Sponsor TS 6798 ALIES FITRIA Rp1.000.000
28/05/2025 Mcu Pra TS 6798 ALIES FITRIA Rp275.000
28/05/2025 Biaya MD TS 6467 GITA WAHYUNI Rp1.500.000
30/05/2025 Keterangan Lain 30052025 SARPRAS Rp5.030.000
09/06/2025 Mcu Pra TS 6799 SUWAEBAH Rp275.000
09/06/2025 Fee Sponsor TS 6799 SUWAEBAH Rp1.000.000
11/06/2025 Living Cost TS 6799 SUWAEBAH Rp1.000.000
12/06/2025 Living Cost TS6779 Rofiqoh Rp1.000.000
12/06/2025 Living Cost TS6695 Melda Sapitri Rp1.000.000
12/06/2025 Living Cost TS 6628 NAFLA FILANA Rp1.000.000
12/06/2025 Transport TS 6779 Rofiqoh Rp500.000
12/06/2025 Fee Sponsor TS 6628 NAFLA FILANA Rp500.000
12/06/2025 Biaya MD TS 6798 ALIES FITRIA Rp1.000.000
16/06/2025 Fee Sponsor TS 6806 DEWI ANGGRAENI Rp1.000.000
16/06/2025 Mcu Pra TS 6806 DEWI ANGGRAENI Rp275.000
18/06/2025 Royalti TS6701 Khodijah Rp750.000
23/06/2025 Fee Sponsor TS6782 Etin Supriatin Rp1.000.000
23/06/2025 Fee Sponsor TS6793 NADIA INDRIYANI Rp1.000.000
23/06/2025 Living Cost TS 6628 NAFLA FILANA Rp1.000.000
23/06/2025 Biaya MD TS 6798 ALIES FITRIA Rp1.000.000
23/06/2025 ID Paspor TS6782 Etin Supriatin Rp200.000
24/06/2025 ID Paspor TS6782 Etin Supriatin Rp1.000.000
04/07/2025 Fee Sponsor TS6782 Etin Supriatin Rp500.000
04/07/2025 Living Cost TS 6816 MAENI Rp1.000.000
04/07/2025 Mcu Pra TS 6816 MAENI Rp275.000
11/07/2025 Living Cost TS 6821 NUR EKA SAFITRI Rp1.000.000
11/07/2025 Fee Sponsor TS 6821 NUR EKA SAFITRI Rp1.000.000
11/07/2025 Biaya MD TS 6798 ALIES FITRIA Rp675.000
11/07/2025 Mcu Pra TS 6821 NUR EKA SAFITRI Rp275.000
15/07/2025 Fee Sponsor TS6779 Rofiqoh Rp2.500.000
15/07/2025 Biaya MD TS 6794 KARTINI Rp1.000.000
22/07/2025 Royalti TS6779 Rofiqoh Rp750.000
22/07/2025 Biaya MD TS 6812 Deniyah Rp550.000
28/07/2025 Keterangan Lain TSJK 1610 SUWADI Rp5.000.000
30/07/2025 Fee Sponsor TSF 6670 WANTONO Rp3.500.000
30/07/2025 Biaya MD TS 6794 KARTINI Rp1.000.000
05/08/2025 Living Cost TS 6831 PUTRI NUR WAWHYUNI Rp1.000.000
05/08/2025 Living Cost TS 6832 NENENG Rp1.000.000
05/08/2025 Living Cost TS 6833 KAMELIYAH Rp1.000.000
05/08/2025 Fee Sponsor TS 6831 PUTRI NUR WAWHYUNI Rp1.000.000
05/08/2025 Fee Sponsor TS 6832 NENENG Rp1.000.000
05/08/2025 Fee Sponsor TS 6833 KAMELIYAH Rp1.000.000
05/08/2025 Mcu Pra TS 6831 PUTRI NUR WAWHYUNI Rp275.000
05/08/2025 Mcu Pra TS 6832 NENENG Rp275.000
05/08/2025 Mcu Pra TS 6833 KAMELIYAH Rp275.000
07/08/2025 Fee Sponsor TS 6832 NENENG Rp1.000.000
07/08/2025 Biaya MD TS6467 Gita Wahyuni Rp500.000
07/08/2025 ID Paspor TS 6790 NURHAYATI Rp1.000.000
08/08/2025 ID Paspor TS 6790 NURHAYATI Rp200.000
11/08/2025 Biaya MD TS 6831 PUTRI NUR WAWHYUNI Rp2.775.000
20/08/2025 Transport TS6782 Etin Supriatin Rp500.000
20/08/2025 Fee Sponsor TS6782 Etin Supriatin Rp2.500.000
20/08/2025 Biaya MD TS 6794 KARTINI Rp525.000
20/08/2025 Biaya MD TS 6806 DEWI ANGGRAENI Rp525.000
03/09/2025 Fee Sponsor TS6758 Nursangadah Rp1.000.000
03/09/2025 Fee Sponsor TS6759 Eva Rahdiyanti Rp1.000.000
03/09/2025 Fee Sponsor TS6765 Rina Rp1.000.000
03/09/2025 Fee Sponsor TS6766 Dima Febrianti Rp1.000.000
03/09/2025 Living Cost TS6758 Nursangadah Rp1.000.000
03/09/2025 Living Cost TS6759 Eva Rahdiyanti Rp1.000.000
03/09/2025 Living Cost TS6765 Rina Rp1.000.000
03/09/2025 Living Cost TS6757 Kadini Rp1.000.000
09/09/2025 Fee Sponsor TS 6853 ANISYA ANGGIE AULIA Rp1.000.000
09/09/2025 Fee Sponsor TSEX 6855 LILI FARIDA Rp1.000.000
09/09/2025 Living Cost TS 6853 ANISYA ANGGIE AULIA Rp1.000.000
09/09/2025 Living Cost TSEX 6855 LILI FARIDA Rp1.000.000
12/09/2025 Living Cost TS 6793 NADIA INDRIYANI Rp1.000.000
12/09/2025 Living Cost TS6782 Etin Supriatin Rp2.500.000
12/09/2025 ID Paspor TS 6821 NUR EKA SAFITRI Rp1.000.000
15/09/2025 ID Paspor TS 6821 NUR EKA SAFITRI Rp200.000
17/09/2025 Fee Sponsor TS 6853 ANISYA ANGGIE AULIA Rp1.000.000
22/09/2025 Fee Sponsor TS 6863 NIA LUSIYANTI Rp1.000.000
22/09/2025 Mcu Pra TSEX 6855 LILI FARIDA Rp275.000
22/09/2025 Mcu Pra TS 6853 ANISYA ANGGIE AULIA Rp275.000
22/09/2025 Mcu Pra TS 6863 NIA LUSIYANTI Rp275.000
25/09/2025 Living Cost TS 6863 NIA LUSIYANTI Rp1.000.000
25/09/2025 ID Paspor TS6766 Dima Febrianti Rp1.200.000
25/09/2025 ID Paspor TS6793 NADIA INDRIYANI Rp1.200.000
25/09/2025 Fee Sponsor TSEX 6855 LILI FARIDA Rp1.000.000
25/09/2025 Fee Sponsor TS 6821 NUR EKA SAFITRI Rp1.000.000
01/10/2025 Royalti TS6782 Etin Supriatin Rp750.000
07/10/2025 ID Paspor TSEX 6855 LILI FARIDA Rp1.200.000
13/10/2025 Biaya MD TS 6711 RIYA RISTINA FAOZIA Rp1.250.000
13/10/2025 Biaya MD TS 6302 NIA KURNIA Rp250.000
13/10/2025 Fee Sponsor TS6793 NADIA INDRIYANI Rp1.500.000
13/10/2025 Fee Sponsor TS6766 Dima Febrianti Rp1.500.000
13/10/2025 Biaya MD TS 6711 RIYA RISTINA FAOZIA Rp1.500.000
16/10/2025 Fee Sponsor TSEX 6855 LILI FARIDA Rp1.500.000
16/10/2025 Biaya MD TS 6302 NIA KURNIA Rp1.500.000
23/10/2025 Royalti TS 6790 NURHAYATI Rp250.000
23/10/2025 Fee Sponsor TS 6790 NURHAYATI Rp1.500.000
23/10/2025 Biaya MD TS 6302 NIA KURNIA Rp275.000
23/10/2025 Biaya MD TS 6318 TRI WINDA ASIH Rp1.250.000
24/10/2025 Royalti TS 6790 NURHAYATI Rp125.000
24/10/2025 Fee Sponsor TS 6816 MAENI Rp1.000.000
24/10/2025 Fee Sponsor TS 6882 NURJAENIH Rp1.000.000
24/10/2025 Fee Sponsor TS 6833 KAMELIYAH Rp1.000.000
24/10/2025 Fee Sponsor TS 6863 NIA LUSIYANTI Rp1.000.000
24/10/2025 Biaya MD TS 6318 TRI WINDA ASIH Rp800.000
24/10/2025 Biaya MD TS 6505 SITI NUR ROBIAH Rp2.050.000
24/10/2025 Biaya MD TS 6578 SISANTI Rp1.150.000
24/10/2025 Mcu Pra TS 6882 NURJAENIH Rp275.000
24/10/2025 Living Cost TS 6882 NURJAENIH Rp500.000
24/10/2025 ID Paspor TS 6853 ANISYA ANGGIE AULIA Rp1.200.000
05/11/2025 Fee Sponsor TS 6853 ANISYA ANGGIE AULIA Rp1.500.000
05/11/2025 Biaya MD TS 6578 SISANTI Rp900.000
05/11/2025 Biaya MD TS 6587 NOVITAYANINGSIH MUNTHE Rp100.000
05/11/2025 Living Cost TS 6853 ANISYA ANGGIE AULIA Rp1.000.000
17/11/2025 Fee Sponsor TS6766 Dima Febrianti Rp1.500.000
17/11/2025 Fee Sponsor TSEX 6855 LILI FARIDA Rp1.500.000
17/11/2025 Biaya MD TS 6625 LINDA AMALIA Rp50.000
17/11/2025 Biaya MD TS 6587 NOVITAYANINGSIH MUNTHE Rp1.950.000
17/11/2025 ID Paspor TS6759 Eva Rahdiyanti Rp1.200.000
17/11/2025 Transport TS6766 Dima Febrianti Rp500.000
17/11/2025 Transport TSEX 6855 LILI FARIDA Rp500.000
17/11/2025 Transport TS 6853 ANISYA ANGGIE AULIA Rp500.000
18/11/2025 Fee Sponsor TS 6897 SITI NURLELA Rp500.000
18/11/2025 Biaya MD TS 6625 LINDA AMALIA Rp250.000
18/11/2025 Mcu Pra TS 6897 SITI NURLELA Rp275.000
19/11/2025 Living Cost TS 6897 SITI NURLELA Rp1.000.000
21/11/2025 Fee Sponsor TS 6793 NADIA INDRIYANI Rp1.500.000
21/11/2025 Biaya MD TS 6625 LINDA AMALIA Rp1.000.000
24/11/2025 Fee Sponsor TS 6816 MAENI Rp500.000
24/11/2025 Fee Sponsor TS 6628 NAFLA FILANA Rp1.500.000
24/11/2025 Biaya MD TS 6625 LINDA AMALIA Rp750.000
24/11/2025 Biaya MD TS 6625 KAMELIA Rp500.000
24/11/2025 Royalti TS6766 Dima Febrianti Rp375.000
24/11/2025 Transport TS 6821 NUR EKA SAFITRI Rp500.000
26/11/2025 Fee Sponsor TS 6897 SITI NURLELA Rp1.500.000
26/11/2025 Fee Sponsor TS6759 Eva Rahdiyanti Rp1.500.000
26/11/2025 Biaya MD TS 6552 DHEANE PUTRI APRILIYANTI Rp450.000
26/11/2025 Biaya MD TS 6625 KAMELIA Rp1.550.000
26/11/2025 ID Paspor TS 6832 NENENG Rp1.200.000
26/11/2025 Transport TS 6759 Eva Rahdiyanti Rp500.000
01/12/2025 ID Paspor TS6765 Rina Rp1.200.000
03/12/2025 Fee Sponsor TS 6853 ANISYA ANGGIE AULIA Rp1.500.000
03/12/2025 Biaya MD TS 6552 DHEANE PUTRI APRILIYANTI Rp1.000.000
05/12/2025 Transport TS 6793 NADIA INDRIYANI Rp500.000
05/12/2025 Royalti TS 6793 NADIA INDRIYANI Rp375.000
09/12/2025 Fee Sponsor TS 6901 FLORA ABELIA Rp500.000
09/12/2025 Mcu Pra TS 6901 FLORA ABELIA Rp275.000
09/12/2025 Living Cost TS 6901 FLORA ABELIA Rp1.000.000
09/12/2025 Royalti TS 6853 ANISYA ANGGIE AULIA Rp375.000
09/12/2025 Biaya MD TS 6552 DHEANE PUTRI APRILIYANTI Rp250.000
11/12/2025 ID Paspor TS 6833 KAMELIYAH Rp1.200.000
11/12/2025 Royalti TSEX 6855 LILI FARIDA Rp375.000
12/12/2025 Fee Sponsor TS 6832 NENENG Rp1.500.000
12/12/2025 Biaya MD TS 6552 DHEANE PUTRI APRILIYANTI Rp350.000
12/12/2025 Biaya MD TS 6439 ALPI Rp650.000
18/12/2025 Fee Sponsor TS6765 Rina Rp1.500.000
18/12/2025 Fee Sponsor TS 6901 FLORA ABELIA Rp1.500.000
18/12/2025 Biaya MD TS 6515 WAHYUNI Rp330.000
18/12/2025 Biaya MD TS 6439 ALPI Rp1.650.000
18/12/2025 Transport TS6765 Rina Rp500.000
22/12/2025 Living Cost TS 6832 NENENG Rp1.000.000
29/12/2025 Living Cost TS 6833 KAMELIYAH Rp1.000.000
29/12/2025 Fee Sponsor TS 6910 NENGSIH Rp500.000
29/12/2025 Mcu Pra TS 6910 NENGSIH Rp275.000
30/12/2025 Fee Sponsor TS 6910 NENGSIH Rp1.500.000
30/12/2025 Living Cost TS 6910 NENGSIH Rp3.000.000
30/12/2025 Biaya MD TS 6515 WAHYUNI Rp1.000.000
06/01/2026 Fee Sponsor TS6759 Eva Rahdiyanti Rp1.500.000
06/01/2026 Fee Sponsor TS6765 Rina Rp1.500.000
06/01/2026 Biaya MD TS 6515 WAHYUNI Rp1.000.000
06/01/2026 Biaya MD TS 6300 SRI WAHYUNI Rp1.000.000
06/01/2026 Living Cost TS6765 Rina Rp2.425.000
06/01/2026 Keterangan Lain TS6765 Rina Tiket Pesawat Rp1.830.000
09/01/2026 Keterangan Lain Laptop & Printer Rp4.400.000
13/01/2026 Royalti TS6765 Rina Rp375.000
23/01/2026 Fee Sponsor TS 6916 NAISYAH SAPITRI Rp500.000
23/01/2026 Living Cost TS 6916 NAISYAH SAPITRI Rp1.000.000
23/01/2026 Mcu Pra TS 6916 NAISYAH SAPITRI Rp275.000
26/01/2026 Fee Sponsor TS 6916 NAISYAH SAPITRI Rp1.500.000
26/01/2026 Biaya MD TS 6300 SRI WAHYUNI Rp1.000.000
27/01/2026 Fee Sponsor TS6783 Yuliyani Rp1.000.000
27/01/2026 Biaya MD TS 6300 SRI WAHYUNI Rp275.000
02/02/2026 Fee Sponsor TS 6833 KAMELIYAH Rp3.000.000
02/02/2026 Transport TS 6833 KAMELIYAH Rp500.000
02/02/2026 Living Cost TS 6833 KAMELIYAH Rp1.000.000
18/01/2024 Fee Sponsor TS 6628 NAFLA FILANA Rp1.500.000
03/02/2026 Royalti TS6759 Eva Rahdiyanti Rp375.000
03/02/2026 Fee Sponsor TS 6920 NOVA ELYANAH PUTRI Rp500.000
03/02/2026 Living Cost TS 6920 NOVA ELYANAH PUTRI Rp1.000.000
03/02/2026 Mcu Pra TS 6920 NOVA ELYANAH PUTRI Rp275.000
09/02/2026 Royalti TS 6833 KAMELIYAH Rp375.000
11/02/2026 Keterangan Lain PLANG DAN DISNAKER Rp1.650.000
23/02/2026 Fee Sponsor TS 6920 NOVA ELYANAH PUTRI Rp1.500.000
23/02/2026 ID Paspor TS 6910 NENGSIH Rp1.200.000
23/02/2026 Fee Sponsor TS 6863 NIA LUSIYANTI Rp500.000
16/03/2026 Living Cost TS 6916 NAISYAH SAPITRI Rp1.000.000
16/03/2026 Keterangan Lain THR DINAS CIREBON Rp500.000
16/03/2026 Keterangan Lain THR DINAS INDRAMAYU Rp300.000
26/03/2026 ID Paspor TS 6916 NAISYAH SAPITRI Rp1.200.000
06/04/2026 Fee Sponsor TS 6916 NAISYAH SAPITRI Rp1.500.000
06/04/2026 Fee Sponsor TS 6863 NIA LUSIYANTI Rp2.500.000
06/04/2026 Fee Sponsor TS 6628 NAFLA FILANA Rp1.500.000
06/04/2026 Transport TS 6910 NENGSIH Rp500.000
ID Paspor TS 6758 NURSANGADAH Rp1.200.000`;

// Helper: safe number formatter
export function formatRupiah(amount: number): string {
  return "Rp" + amount.toLocaleString("id-ID");
}

// Convert DD/MM/YYYY to YYYY-MM-DD
export function parseIndoDate(dateStr: string): string {
  try {
    const parts = dateStr.trim().split("/");
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    // ignores
  }
  return "2025-01-01"; // Fallback
}

// Full parser engine accessible in-app
export function parseCPMIRows(rawText: string): CPMI[] {
  const result: CPMI[] = [];
  const lines = rawText.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Direct pattern matching e.g. "2 TS 6317 WANTIAH Taiwan Perempuan TKW (In Formal) PT. TRIAS INSAN MADANI FLIGHT Pa Hj Nono"
    // Or "1 TSEX 6440 AMELIA KONAAH FLIGHT PA Irwan"
    // Let's tokenize by space and match components
    const tokens = trimmed.split(/\s+/);
    if (tokens.length < 4) continue;

    const indexNum = parseInt(tokens[0], 10);
    if (isNaN(indexNum)) continue;

    // Detect ID e.g. "TS" or "TSEX" + number
    let idType = tokens[1];
    let idVal = tokens[2];
    let offset = 3;

    if (!/^\d+$/.test(idVal)) {
      // In case TS and 6317 were somehow combined or ID format varies
      if (/^(TS|TSEX)\d+$/i.test(tokens[1])) {
        const match = tokens[1].match(/^(TS|TSEX)(\d+)$/i);
        if (match) {
          idType = match[1].toUpperCase();
          idVal = match[2];
          offset = 2;
        }
      } else {
        // Fallback or skip if not matching standard format
        idType = "TS";
        idVal = tokens[1];
        offset = 2;
      }
    }

    const cpmiId = `${idType} ${idVal}`;

    // Now extract name, status, sponsor
    // Let's look for known keywords like "FLIGHT", "BNSP/BLK", "PROCESS", "FINAL STAGE", "VERIF ID"
    // Check if "PT. TRIAS INSAN MADANI" exists
    let nameParts: string[] = [];
    let state = "NAME"; // NAME -> PT_STUFF? -> STATUS -> RECRUITER
    let status = "PROCESS";
    let recruiter = "";

    // Let's loop from offset to end of tokens
    for (let i = offset; i < tokens.length; i++) {
      const tok = tokens[i];
      const upperTok = tok.toUpperCase();

      if (
        upperTok === "FLIGHT" ||
        upperTok === "BNSP/BLK" ||
        upperTok === "PROCESS" ||
        upperTok === "FINAL" ||
        upperTok === "VERIF"
      ) {
        // Collect status
        if (upperTok === "FINAL" && tokens[i+1]?.toUpperCase() === "STAGE") {
          status = "FINAL STAGE";
          i++;
        } else if (upperTok === "VERIF" && tokens[i+1]?.toUpperCase() === "ID") {
          // Gather complete "VERIF ID MAS HASAN" or just "VERIF ID"
          status = "VERIF ID";
          if (tokens[i+2]?.toUpperCase() === "MAS" && tokens[i+3]?.toUpperCase() === "HASAN") {
            status = "VERIF ID MAS HASAN";
            i += 3;
          } else {
            i += 1;
          }
        } else if (upperTok === "FLIGHT") {
          status = "TERBANG (FLIGHT)";
        } else {
          status = tok;
        }
        
        // Everything after status is the recruiter/sponsor
        recruiter = tokens.slice(i + 1).join(" ");
        break;
      } else if (
        upperTok === "TAIWAN" ||
        upperTok === "PEREMPUAN" ||
        upperTok === "TKW" ||
        upperTok === "PT." ||
        upperTok === "TRIAS"
      ) {
        // This is part of the common static details, stop appending to name
        continue;
      } else {
        nameParts.push(tok);
      }
    }

    // fallback recruiter if empty
    if (!recruiter && nameParts.length > 1) {
      // In case no status keyword was found, maybe last 2 tokens are status and recruiter
      // Let's just keep status as "PROCESS" and the rest as name
    }

    const cleanName = nameParts.join(" ").replace(/Indonesia|PT\.|TRIAS|INSAN|MADANI|Perempuan|Taiwan|\(In\s+Formal\)/g, "").trim();

    result.push({
      id: cpmiId,
      indexNum,
      name: cleanName || "Kandidat CPMI",
      status: status as ProcessStatus,
      dateInput: "2025-01-15", // Seed date
      destination: "Taiwan",
      gender: "Perempuan",
      category: "TKW (In Formal)",
      agency: "PT. TRIAS INSAN MADANI",
      recruiter: recruiter.trim() || "Kantor Pusat",
      documents: {
        ktp: true,
        kk: true,
        ijazah: true,
        aktaLahir: true,
        suratIzinKeluarga: true,
        paspor: status !== "PROCESS" && status !== "BNSP/BLK",
        medicalCheck: true
      }
    });
  }

  return result;
}

export function parseTransactionRows(rawText: string): Transaction[] {
  const result: Transaction[] = [];
  const lines = rawText.split("\n");

  let latestDate = "2025-02-26";

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trim();
    if (!line) continue;

    // Check if line starts with a date "DD/MM/YYYY"
    const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{4})/);
    let date = latestDate;
    let restOfLine = line;

    if (dateMatch) {
      date = parseIndoDate(dateMatch[1]);
      latestDate = date; // update latest date to carry forward back-to-back items
      restOfLine = line.substring(dateMatch[1].length).trim();
    } else {
      // Date is missing (like the last line "ID Paspor TS 6758 NURSANGADAH Rp1.200.000")
      // We keep the latestDate
    }

    // Extract amount "Rp..."
    const rpMatch = restOfLine.match(/Rp\s*([\d.]+)/i);
    let amountVal = 0;
    if (rpMatch) {
      amountVal = parseInt(rpMatch[1].replace(/\./g, ""), 10);
      restOfLine = restOfLine.replace(rpMatch[0], "").trim();
    }

    // Now look for Category e.g., "Fee Sponsor", "Biaya MD", "ID Paspor", "Living Cost", "Transport", "Mcu Pra", "Royalti", "Keterangan Lain"
    const categories: TransactionCategory[] = [
      "Fee Sponsor",
      "Biaya MD",
      "ID Paspor",
      "Living Cost",
      "Transport",
      "Mcu Pra",
      "Royalti",
      "Keterangan Lain",
    ];

    let detectedCategory = "Keterangan Lain";
    for (const cat of categories) {
      const regex = new RegExp("^" + cat.replace(/\s+/g, "\\s+"), "i");
      if (regex.test(restOfLine)) {
        detectedCategory = cat;
        restOfLine = restOfLine.replace(regex, "").trim();
        break;
      }
    }

    // Now look for CPMI code e.g. "TS6701" or "TS 6701" or "TSEX 6440" or "TSEX6343"
    // Also support "TSF 6670" and "TSJK 1610"
    const codeMatch = restOfLine.match(/([a-zA-Z]+)\s*(\d+)/);
    let pmiRef = "";
    let pmiName = "";
    let description = restOfLine;

    if (codeMatch) {
      const codePrefix = codeMatch[1].toUpperCase();
      const codeNum = codeMatch[2];
      
      // Filter out prefixes that are not candidate indicators (e.g. general words)
      const allowedPrefixes = ["TS", "TSEX", "TSF", "TSJK"];
      if (allowedPrefixes.includes(codePrefix)) {
        pmiRef = `${codePrefix} ${codeNum}`;
        // Extract the remaining text as name or description
        const parts = restOfLine.split(codeMatch[0]);
        pmiName = parts[1] ? parts[1].trim() : "";
        
        // If there's an active name, clean up and set description
        description = `${detectedCategory} untuk ${pmiRef} ${pmiName}`.trim();
      } else {
        pmiRef = "OPERASIONAL";
        description = restOfLine;
      }
    } else {
      pmiRef = "OPERASIONAL";
      description = restOfLine;
    }

    result.push({
      id: `tx-${idx}-${Date.now() % 10000}`,
      date,
      category: detectedCategory,
      pmiRef,
      pmiName: pmiName || undefined,
      value: amountVal,
      description: description || `${detectedCategory} - Operasional`,
    });
  }

  return result;
}

// Initial parsed dataset of both tables
export const SEED_CPMIS: CPMI[] = parseCPMIRows(RAW_CPMI_DATA);
export const SEED_TRANSACTIONS: Transaction[] = parseTransactionRows(RAW_TRANSACTIONS_DATA);

// Group standard options
export const CPMI_STATUS_OPTIONS: ProcessStatus[] = [
  "PROCESS",
  "BNSP/BLK",
  "ID PASPOR",
  "FINAL STAGE",
  "TERBANG (FLIGHT)",
  "CANCEL",
  "TOLAK",
  "SPONSOR",
  "UPDATE DOKUMEN KELENGKAPAN",
  "VERIF ID"
];

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  "Fee Sponsor",
  "Biaya MD",
  "ID Paspor",
  "Living Cost",
  "Transport",
  "Mcu Pra",
  "Royalti",
  "Keterangan Lain"
];
