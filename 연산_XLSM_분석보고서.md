# 연산.xlsm 정적 분석 보고서

> 분석 방식: 원본을 저장하거나 수정하지 않고 XLSM의 Open XML, VML/도형 관계, 프린터 바이너리, VBA OLE 스트림을 읽기 전용으로 분석했다. 매크로는 실행하지 않았다.

## 1. 결론

이 통합문서는 일반적인 셀 입력형 계산기가 아니라, 초등 수학 문제를 난수로 생성하고 정답을 숨기거나 표시하며 인쇄하는 워크시트형 문제 생성기다. 수학 로직, 문제 재생성, 정답 표시, 시트 선택, 인쇄는 웹으로 구현할 수 있다. 다만 Excel의 전역 재계산, 셀 글자색을 이용한 정답 은폐, UserForm, 보호 시트, 인쇄 설정, 시계/도형·필기 영역은 웹 상태 모델·SVG/Canvas·인쇄 CSS로 재설계해야 한다.

정적 분석에서 이미 확인되는 끊어진 연결이 있다: 매크로가 존재하지 않는 버튼 배정 11건, 존재하지 않는 시트를 가리키는 UserForm 이벤트 4건, 존재하지 않는 `결과입력` 폼 호출 1건, `#NAME?`인 숨김 정의 이름 1개, 숨김 `연습일지`의 캐시된 `#VALUE!` 수식 39개다. 동일 동작을 웹에 옮기기 전에 이 항목들의 의도를 확정해야 한다.

## 2. 파일 및 구조 요약

| 항목 | 값 |
| --- | --- |
| 원본 | C:\Users\A\Desktop\연산.xlsm |
| SHA-256 | 5AF29735E31D385E29B3F6CF1629FC4FE4F7B0BCD1DA2A837EAC465595E76F9E |
| 크기 | 1,267,084 bytes |
| 워크시트 | 81개: 보임 64, 숨김 17, veryHidden 0 |
| 통합문서 구조 보호 | lockStructure=1, SHA-512 해시 |
| 내용 셀 | 12,798 |
| 수식 셀 | 7,191 |
| 정의 이름 | 1개 |
| Excel 표 | 0개 |
| 데이터 유효성 검사 | 0개 |
| 조건부서식 | 8개 범위 / 10개 규칙 |
| 폼 컨트롤 | 208개 |
| 매크로 연결 도형/그림 | 67개 |
| 프린터 설정 | 69개 |
| VBA | 표준 모듈 49, 문서 모듈 82, UserForm 1, 클래스 모듈 0, 프로시저 166 |

## 3. 시트·수식·컨트롤 전수 목록

수식 예시는 각 시트의 첫 수식들이다. `난수 셀`은 `RAND` 또는 `RANDBETWEEN`을 포함하는 수식 주소이며, 이 값이 해당 시트의 문제와 정답을 함께 구동한다.

| # | 시트 | 상태 | 코드명 | 사용 범위 | 수식 | 함수 | 시트 선행값 | 난수 셀 | 사용자 동작 | 수식 근거 예 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 연습일지 | hidden | Sheet27 | A1:N47 | 40 | REPT:39, COUNT:1 |  |  | 현재시트저장, 입력창띄워, 일지제목바꾸기, 일지초기화, 문제지선택, 메모폼, 인쇄 | C4="문제(총"&COUNT($D$5:$D$44)&"장)"<br>G5=REPT("―",E5-2)<br>G6=REPT("―",E6-2) |
| 2 | 1수세기① | visible | Sheet59 | A1:T49 | 48 | INDEX:27, RANK:15, RAND:15, REPT:9 |  | P7:P18, P22:P24 | 문제바꾸기, first개수_답, first개수_문제, 문제지선택, 인쇄 | A5=REPT(INDEX($Q$16:$Q$18,O16),B6)<br>J5=REPT(INDEX($Q$16:$Q$18,O16),INDEX($Q$7:$Q$15,O10))<br>B6=INDEX($Q$7:$Q$15,O7) |
| 3 | 1덧셈뺄셈① | visible | Sheet31 | A1:Q28 | 110 | RANDBETWEEN:50, INDEX:20, RANK:20, RAND:20, IF:10 |  | C3, C5, C7, C9, C11, C13, C15, C17, C19, C21, G3, G5, G7, G9, G11, G13, G15, G17, G19, G21, L3:L12, L14:L23, M3, M5, M7, M9, M11, M13, M17, M19, M21, O3, O7, O15, O17, O19, Q5, Q9, Q11, Q13, Q15, Q21 | 문제바꾸기, first덧셈a_답, first덧셈a_문제, 인쇄 | A3=E3-C3<br>C3=IF(E3=3,RANDBETWEEN(0,3),RANDBETWEEN(2,E3-2))<br>E3=INDEX($F$3:$F$12,RANK($L$3,$L$3:$L$12),1) |
| 4 | 1덧셈뺄셈② | visible | Sheet35 | A1:Q28 | 90 | RANDBETWEEN:120, LEFT:30, RIGHT:30 |  | C3, C5, C7, C9, C11, C13, C15, C17, C19, C21, E3, E5, E7, E9, E11, E13, E15, E17, E19, E21, G3, G5, G7, G9, G11, G13, G15, G17, G19, G21, I3, I5, I7, I9, I11, I13, I15, I17, I19, I21, M3, M7, M9, M13, M17, M19, O3, O5, O7, O9, O11, O13, O15, O17, O19, O21, Q5, Q11, Q15, Q21 | first덧셈a_답, first덧셈a_문제, 문제바꾸기, 인쇄 | A3=E3-C3<br>C3=RANDBETWEEN(0,LEFT(E3,1))*10+RANDBETWEEN(0,RIGHT(E3,1))<br>E3=RANDBETWEEN(2,9)*10+RANDBETWEEN(2,9) |
| 5 | 1주고받기 | visible | Sheet36 | A1:N45 | 24 | MID:13, RANDBETWEEN:9, SUM:4, INDEX:1, VLOOKUP:1 |  | A17, A24, A31:A32, B9:B11 | 문제바꾸기, first딱지_문제, first딱지_답, 인쇄 | A2="  글을 읽고 물음에 답하시오.[1~3번]<br>  지혜, 슬기, 용기는 카드 놀이를 하려고 합니다. 카드를 지혜는 "&B9&"장, 슬기는 "&B10&"장, 용기는 "&B11&"장 가지고 있습니다."<br>B9=RANDBETWEEN(7,9)<br>C9=B9-MID($A$17,26,1)-MID($A$17,42,1) |
| 6 | 1보수 | visible | Sheet6 | A1:U28 | 170 | RANDBETWEEN:40, INDEX:30, RANK:30, RAND:30 |  | C3, C5, C7, C9, C11, C13, C15, C17, C19, C21, G5, G7, G9, G11, G13, G15, G17, G19, G21, I3, M4, M6, M8, M10, M12, M14, M16, M18, M20, M22, O4, O6, O8, O10, O12, O14, O16, O18, O20, O22, S4, S6, S8, S10, S12, S14, S16, S18, S20, S22, T4, T6, T8, T10, T12, T14, T16, T18, T20, T22, U4, U6, U8, U10, U12, U14, U16, U18, U20, U22 | first보수_답, first보수_문제, 문제바꾸기, 인쇄 | C3=RANDBETWEEN(3,9)<br>E3=A3-C3<br>G3=K3-I3 |
| 7 | 1덧셈뺄셈③ | visible | Sheet33 | A1:Q28 | 90 | RANDBETWEEN:60 |  | C3, C5, C7, C9, C11, C13, C15, C17, C19, C21, E3, E5, E7, E9, E11, E13, E15, E17, E19, E21, G3, G5, G7, G9, G11, G13, G15, G17, G19, G21, K3, K5, K7, K9, K11, K13, K15, K17, K19, K21, M3, M5, M9, M13, M17, M21, O7, O11, O15, O19, Q3, Q5, Q7, Q9, Q11, Q13, Q15, Q17, Q19, Q21 | first덧셈뺄셈2_답, first덧셈뺄셈2_문제, 문제바꾸기, 인쇄 | A3=E3-C3<br>C3=RANDBETWEEN(6,9)<br>E3=RANDBETWEEN(11,18) |
| 8 | 1덧셈뺄셈④ | visible | Sheet32 | A1:Q28 | 90 | RANDBETWEEN:60 |  | A3, A5, A7, A9, A13, A15, A19, A21, C11, C17, E3, E5, E7, E9, E11, E13, E15, E17, E19, E21, G3, G5, G7, G9, G11, G13, G15, G17, G19, G21, K3, K5, K7, K9, K11, K13, K15, K17, K19, K21, M3, M5, M7, M9, M11, M13, M15, M17, M19, M21, Q3, Q5, Q7, Q9, Q11, Q13, Q15, Q17, Q19, Q21 | first덧셈b_답, first덧셈뺄셈3_문제, 문제바꾸기, first덧셈뺄셈4_답, 인쇄 | A3=RANDBETWEEN(11,18)<br>C3=A3-E3<br>E3=RANDBETWEEN(2,9) |
| 9 | 뛰어세기원본 | hidden | Sheet48 | A1:E10 | 50 | RANDBETWEEN:20, IF:18, RAND:10, RANK:10 |  | A1:A10, C1, D1:D10 |  | A1=RAND()<br>B1=RANK(A1,$A$1:$A$10)<br>C1=RANDBETWEEN(6,9) |
| 10 | 수읽기문제 | hidden | Sheet61 | A2:Z23 | 76 | RANK:38, RAND:38 |  | B4:B12, D3, E3, F3, G3, H3, I3, J3, K3, L3, M3, P15:P23, Q14, R14, S14, T14, U14, V14, W14, X14, Y14, Z14 |  | D2=RANK(D3,$D$3:$M$3)<br>E2=RANK(E3,$D$3:$M$3)<br>F2=RANK(F3,$D$3:$M$3) |
| 11 | 1수읽기 | visible | Sheet60 | B1:P36 | 36 | INDEX:36 | 수읽기문제(36) |  | 문제바꾸기, first읽기_답, first읽기_문제, 인쇄 | B5=INDEX(수읽기문제!$D$4:$M$12,수읽기문제!$A4,수읽기문제!D$2)<br>D5=INDEX(수읽기문제!$D$15:$M$23,수읽기문제!$A4,수읽기문제!D$2)<br>I5=INDEX(수읽기문제!$Q$15:$Z$23,수읽기문제!$O15,수읽기문제!Q$13) |
| 12 | 1뛰어세기 | visible | Sheet34 | B1:T28 | 70 | INDEX:10, VLOOKUP:10 | 뛰어세기원본(20), 1뛰어세기(10) |  | first뛰어세기_문제, 문제바꾸기, first뛰어세기_답, 인쇄 | B4=INDEX(뛰어세기원본!$D$1:$D$10,뛰어세기원본!$B$1,1)<br>D4=B4+VLOOKUP('1뛰어세기'!B4,뛰어세기원본!$D$1:$E$10,2,FALSE)<br>F4=D4+D4-B4 |
| 13 | 2덧셈뺄셈① | visible | Sheet76 | A1:M29 | 48 | RANDBETWEEN:48 |  | B3:B4, B9:B10, B15:B16, B21:B22, D3:D4, D9:D10, D15:D16, D21:D22, F3:F4, F9:F10, F15:F16, F21:F22, H3:H4, H9:H10, H15:H16, H21:H22 | third덧셈뺄셈_답, third덧셈뺄셈_문제, 문제바꾸기, 문제지선택, 인쇄 | B3=RANDBETWEEN(4,9)*10+RANDBETWEEN(3,7)<br>D3=RANDBETWEEN(21,99)<br>F3=RANDBETWEEN(1,6)*10+RANDBETWEEN(2,9) |
| 14 | 2덧셈뺄셈② | visible | Sheet75 | B1:Q32 | 78 | RANDBETWEEN:48, IF:48, AND:36, OR:6 |  | C3, C5, C11, C13, C19, C21, C27, C29, D3, D5, D11, D13, D19, D21, D27, D29, I3, I5, I11, I13, I19, I21, I27, I29, J3, J5, J11, J13, J19, J21, J27, J29, O3, O5, O11, O13, O19, O21, O27, O29, P3, P5, P11, P13, P19, P21, P27, P29 | third빈칸_답, third빈칸_문제, 문제바꾸기, 인쇄 | C3=RANDBETWEEN(1,9)<br>D3=RANDBETWEEN(0,8)<br>I3=RANDBETWEEN(1,9) |
| 15 | 2덧셈뺄셈③ | visible | Sheet40 | A1:S46 | 90 | RANDBETWEEN:86 |  | A3, A7, A11, A15, A19, A23, A27, A31, A35, A39, C3, C7, C11, C19, C23, C27, E15, E31, E35, E39, H3, H7, H11, H15, H19, H23, H27, H31, H35, H39, J3, J7, J15, J19, J23, J31, J35, L11, L27, L39, O3, O7, O11, O15, O19, O23, O27, O31, O35, O39, Q3, Q11, Q15, Q35, Q39, S7, S19, S23, S27, S31 | first덧셈b_답, second덧셈뺄셈_문제, 문제바꾸기, second덧셈뺄셈_답, 문제지선택, 인쇄 | A3=10*RANDBETWEEN(2,9)+RANDBETWEEN(0,5)<br>C3=RANDBETWEEN(0,A3)<br>E3=A3-C3 |
| 16 | 구구단원본 | hidden | Sheet24 | A1:L100 | 425 | RANK:172, RAND:172, RANDBETWEEN:9 |  | B2:B10, B12:B20, B22:B30, B32:B40, B42:B50, B52:B60, B62:B70, B72:B80, K1:K100, L65:L73 |  | J1=RANK(K1,$K$1:$K$100)<br>K1=RAND()<br>A2=RANK(B2,$B$2:$B$10) |
| 17 | 2묶어세기 | visible | Sheet46 | A1:Y48 | 432 | IF:402, AND:336, RAND:12, INDEX:12, RANK:12, COUNTIF:6 |  | J6:J11, W6:W11 | 문제바꾸기, second개수세기_답, second개수세기_문제, 인쇄 | D3=IF($A$12>2,"♧"," ")<br>E3=IF($A$12>3,"♧"," ")<br>F3=IF($A$12>4,"♧"," ") |
| 18 | 2길이재기 | visible | Sheet45 | B1:S27 | 47 | REPT:15, RAND:12, RANK:12, INDEX:8 |  | C19, D19, E19, F19, G19, H19, I19, J19, K19, L19, M19, N19 | second어림_문제, 문제바꾸기, second어림_답, 인쇄 | D4=INDEX($C$20:$R$21,2,C20)<br>F4=REPT("─",2*D4)<br>F5=REPT("─",2*D5) |
| 19 | 2구구단① | visible | Sheet41 | A1:Q28 | 60 | INDEX:18, RANDBETWEEN:12 | 구구단원본(18) | C21, I21, O3, O5, O7, O9, O11, O13, O15, O17, O19, O21 | first덧셈b_답, second구구단_문제, 문제바꾸기, second구구단_답, 인쇄 | C3=INDEX(구구단원본!$A$2:$D$10,구구단원본!A2,4)<br>E3=A3*C3<br>I3=INDEX(구구단원본!$A$12:$D$20,구구단원본!A12,4) |
| 20 | 2구구단② | visible | Sheet42 | A1:Q28 | 60 | INDEX:18, RANDBETWEEN:12 | 구구단원본(18) | C21, I21, O3, O5, O7, O9, O11, O13, O15, O17, O19, O21 | first덧셈b_답, second구구단_문제, 문제바꾸기, second구구단_답, 인쇄 | C3=INDEX(구구단원본!$A$22:$D$30,구구단원본!A22,4)<br>E3=A3*C3<br>I3=INDEX(구구단원본!$A$32:$D$40,구구단원본!A32,4) |
| 21 | 2구구단③ | visible | Sheet43 | A1:Q28 | 60 | INDEX:18, RANDBETWEEN:12 | 구구단원본(18) | C21, I21, O3, O5, O7, O9, O11, O13, O15, O17, O19, O21 | first덧셈b_답, second구구단_문제, 문제바꾸기, second구구단_답, 인쇄 | C3=INDEX(구구단원본!$A$42:$D$50,구구단원본!A42,4)<br>E3=A3*C3<br>I3=INDEX(구구단원본!$A$52:$D$60,구구단원본!A52,4) |
| 22 | 2구구단④ | visible | Sheet44 | A1:Q28 | 60 | INDEX:18, RANDBETWEEN:12 | 구구단원본(18) | C21, I21, O3, O5, O7, O9, O11, O13, O15, O17, O19, O21 | first덧셈b_답, second구구단_문제, 문제바꾸기, second구구단_답, 인쇄 | C3=INDEX(구구단원본!$A$62:$D$70,구구단원본!A62,4)<br>E3=A3*C3<br>I3=INDEX(구구단원본!$A$52:$D$60,구구단원본!A52,4) |
| 23 | 2구구단⑤ | visible | Sheet13 | A1:P25 | 200 | INDEX:100, LEFT:100, MID:100 | 구구단원본(100) |  | 구구단_답, 구구단_문제, 문제바꾸기, 인쇄 | A3=INDEX(구구단원본!$J$1:$L$100,구구단원본!J1,3)<br>C3=LEFT(A3,1)*MID(A3,3,1)<br>D3=INDEX(구구단원본!$J$1:$L$100,구구단원본!J21,3) |
| 24 | 2시계① | visible | Sheet62 | A1:O34 | 0 |  |  |  | second시계A_문제, second시계A_답, 인쇄 |  |
| 25 | 2시계② | visible | Sheet63 | A1:O34 | 0 |  |  |  | second시계A_문제, second시계A_답, 인쇄 |  |
| 26 | 3덧셈뺄셈 | visible | Sheet49 | A1:M29 | 48 | RANDBETWEEN:96, LEFT:8 |  | B3:B4, B9:B10, B15:B16, B21:B22, D3:D4, D9:D10, D15:D16, D21:D22, F3:F4, F9:F10, F15:F16, F21:F22, H3:H4, H9:H10, H15:H16, H21:H22 | third덧셈뺄셈_답, third덧셈뺄셈_문제, 문제바꾸기, 문제지선택, 인쇄 | B3=RANDBETWEEN(0,9)*100+RANDBETWEEN(4,9)*10+RANDBETWEEN(3,9)<br>D3=RANDBETWEEN(6,9)*100+RANDBETWEEN(0,4)*10+RANDBETWEEN(0,4)<br>F3=RANDBETWEEN(0,9)*100+RANDBETWEEN(4,9)*10+RANDBETWEEN(3,9) |
| 27 | 3덧셈뺄셈빈칸 | visible | Sheet73 | B1:Q32 | 114 | RANDBETWEEN:72, IF:57, AND:36, OR:6 |  | C3, C5, C11, C13, C19, C21, C27, C29, D3, D5, D11, D13, D19, D21, D27, D29, E3, E5, E11, E13, E19, E21, E27, E29, I3, I5, I11, I13, I19, I21, I27, I29, J3, J5, J11, J13, J19, J21, J27, J29, K3, K5, K11, K13, K19, K21, K27, K29, O3, O5, O11, O13, O19, O21, O27, O29, P3, P5, P11, P13, P19, P21, P27, P29, Q3, Q5, Q11, Q13, Q19, Q21, Q27, Q29 | third빈칸_답, third빈칸_문제, 문제바꾸기, 인쇄 | C3=RANDBETWEEN(4,9)<br>D3=RANDBETWEEN(0,8)<br>E3=RANDBETWEEN(2,7) |
| 28 | 3보수뺄셈100 | visible | Sheet70 | A1:M29 | 55 | RANDBETWEEN:55 |  | D3, D5, D7, D9, D11, D13, D15, D17, D19, D21, D23, H3, H5, H7, H9, H11, H13, H15, H17, H19, H21, H23, J3, J5, J7, J9, J11, J13, J15, J17, J19, J21, J23 | third덧셈뺄셈b_답, third덧셈뺄셈b_문제, 문제바꾸기, 인쇄 | D3=RANDBETWEEN(2,7)*10+RANDBETWEEN(1,9)<br>F3=B3-D3<br>H3=100+RANDBETWEEN(1,3) |
| 29 | 3보수뺄셈1000 | visible | Sheet71 | A1:M29 | 40 | RANDBETWEEN:20 |  | D3, D5, D7, D9, D11, D13, D15, D17, D19, D21, J3, J5, J7, J9, J11, J13, J15, J17, J19, J21 | third덧셈뺄셈b_답, third덧셈뺄셈b_문제, 문제바꾸기, 인쇄 | D3=RANDBETWEEN(13,B3-11)<br>F3=B3-D3<br>J3=RANDBETWEEN(13,H3-11) |
| 30 | 3덧셈뺄셈② | visible | Sheet69 | A1:M29 | 60 | RANDBETWEEN:65 |  | B3, B7, B9, B11, B13, B15, B17, B19, B21, D3, D5, D7, D9, D11, D13, D15, D17, D19, D21, H3, H5, H7, H9, H11, H13, H15, H17, H19, H21, J3, J5, J7, J9, J11, J13, J15, J17, J19, J21 | third덧셈뺄셈b_답, third덧셈뺄셈b_문제, 문제바꾸기, 인쇄 | B3=RANDBETWEEN(2,5)*100+RANDBETWEEN(2,8)*10+RANDBETWEEN(3,9)<br>D3=RANDBETWEEN(2,8)*100<br>F3=B3+D3 |
| 31 | 3나눗셈① | visible | Sheet12 | A1:K47 | 60 | IF:40, RANDBETWEEN:10, QUOTIENT:10 |  | A5, A9, A13, A17, A21, A25, A29, A33, A37, A41 | 문제바꾸기, 포함등분_문제, 포함등분_답, 인쇄 | A5=RANDBETWEEN(2,3)<br>I5=IF(A5=3,"ooo","oo")<br>J5=IF(A5=3,"ooo","oo") |
| 32 | 3곱셈① | visible | Sheet50 | A1:K29 | 48 | RANDBETWEEN:32 |  | B3:B4, B9:B10, B15:B16, B21:B22, D3:D4, D9:D10, D15:D16, D21:D22, F3:F4, F9:F10, F15:F16, F21:F22, H3:H4, H9:H10, H15:H16, H21:H22 | third곱셈1_답, third곱셈1_문제, 문제바꾸기, 인쇄 | B3=RANDBETWEEN(77,99)<br>D3=RANDBETWEEN(77,99)<br>F3=RANDBETWEEN(77,99) |
| 33 | 3곱셈② | visible | Sheet72 | A1:M29 | 66 | RANDBETWEEN:44 |  | B3, B5, B7, B9, B11, B13, B15, B17, B19, B21, B23, D3, D5, D7, D9, D11, D13, D15, D17, D19, D21, D23, H3, H5, H7, H9, H11, H13, H15, H17, H19, H21, H23, J3, J5, J7, J9, J11, J13, J15, J17, J19, J21, J23 | third덧셈뺄셈b_답, third덧셈뺄셈b_문제, 문제바꾸기, 인쇄 | B3=RANDBETWEEN(11,99)<br>D3=RANDBETWEEN(2,9)<br>F3=B3*D3 |
| 34 | 3길이 | visible | Sheet8 | A1:O31 | 74 | IF:67, RANDBETWEEN:36, AND:31, MID:24, RIGHT:8, OR:4 |  | B3:B4, B8:B9, B18:B19, D3:D4, D8:D9, D18:D19, G3:G4, G8:G9, G18:G19, I3:I4, I8:I9, I18:I19, L3:L4, L8:L9, L18:L19, N3:N4, N8:N9, N18:N19 | 길이_문제, 문제바꾸기, 길이_답, 인쇄 | B2=IF(AND(D3+D4>=1000,RIGHT(B3,1)+RIGHT(B4,1)>=10),"  1 1 ",IF(D3+D4>=1000,"  1",IF(RIGHT(B3,1)+RIGHT(B4,1)>=10,"1  ","")))<br>D2=IF(AND(MID(D3,3,1)+MID(D4,3,1)>=10,MID(D3,2,1)+MID(D4,2,1)>=10),"1 1",IF(AND(MID(D3,3,1)+MID(D4,3,1)>=10,MID(D3,2,1)+MID(D4,2,1)<10),"  1",IF(AND(MID(D3,3,1)+MID(D4,3,1)<10,MID(D3,2,1)+MID(D4,2,1)>=10),"1   ","")))<br>B3=RANDBETWEEN(1,5) |
| 35 | 3시간① | visible | Sheet7 | A1:T26 | 62 | RANK:16, RAND:16, RANDBETWEEN:12, LEFT:6, MID:6 |  | C4, C8, C12, C16, C20, C24, I2, I6, I10, I14, I18, I22, L7:L14, L16:L23 | third시간1_답, third시간1_문제, 문제바꾸기, 인쇄 | C2=60*G2+I2<br>G2=K7<br>I2=RANDBETWEEN(1,59) |
| 36 | 3시간② | visible | Sheet68 | A1:T30 | 64 | IF:42, RANDBETWEEN:32, AND:8 |  | B7:B8, B12:B13, B17:B18, B23, B27, D7:D8, D12:D13, D17:D18, D23, D27, G23, G27, I7:I8, I12:I13, I17:I18, I23, I27, K7:K8, K12:K13, K17:K18 | third시간_답, third시간_문제, 문제바꾸기, 인쇄 | B7=RANDBETWEEN(1,12)<br>D7=RANDBETWEEN(1,59)<br>I7=RANDBETWEEN(30,59) |
| 37 | 3곱셈③ | visible | Sheet1 | A1:AJ29 | 80 | RANDBETWEEN:32 |  | B3:B4, B9:B10, B15:B16, B21:B22, D3:D4, D9:D10, D15:D16, D21:D22, F3:F4, F9:F10, F15:F16, F21:F22, H3:H4, H9:H10, H15:H16, H21:H22 | third곱셈_답, third곱셈_문제, 문제바꾸기, 인쇄 | B3=RANDBETWEEN(666,999)<br>D3=RANDBETWEEN(666,999)<br>F3=RANDBETWEEN(666,999) |
| 38 | 19단 | visible | Sheet16 | A1:H20 | 60 | INDEX:30, LEFT:30, MID:30 | 19단원본(30) |  | 십구단_답, 십구단_문제, 문제바꾸기, 인쇄 | A2=INDEX('19단원본'!$B$1:$B$30,'19단원본'!A1,1)<br>B2=LEFT(A2,2)*MID(A2,4,2)<br>D2=INDEX('19단원본'!$B$1:$B$30,'19단원본'!A11,1) |
| 39 | 제곱수 | visible | Sheet14 | A1:N51 | 99 | INDEX:27, RANK:27, RAND:27, VLOOKUP:9 |  | A19:A20, B19:B20, C19:C20, D19:D20, E19:E20, F19:F20, G19:G20, G22:G30, H19:H20, I19:I20 | 제곱수_문제, 제곱수_답, 문제바꾸기, 인쇄 | A8=INDEX($A$21:$I$21,1,RANK(A20,$A$20:$I$20))<br>B8="× "&A8&" ="<br>C8=A8^2 |
| 40 | 3나눗셈② | visible | Sheet74 | A1:X29 | 116 | RANDBETWEEN:45, QUOTIENT:25, MOD:25, RAND:8, RANK:8, INDEX:5 |  | B3, B5, B7, B9, B11, B13, B15, B17, B19, B21, D3, D5, D7, D9, D11, D13, D15, D17, D19, D21, J3, J5, J7, J9, J11, J13, J15, J17, J19, J21, L3, L5, L7, L9, L11, L13, L15, L17, L19, L21, Q21, R3, R7, R11, R15, R19, R21, S21, T21, U21, V21, W21, X21 | third나눗셈B_답, third나눗셈B_문제, 문제바꾸기, 인쇄 | B3=RANDBETWEEN(11,99)<br>D3=RANDBETWEEN(2,9)<br>F3=QUOTIENT(B3,D3) |
| 41 | 3나눗셈③원본 | hidden | Sheet78 | A1:C58 | 58 | RAND:58 |  | C1:C58 |  | C1=RAND()<br>C2=RAND()<br>C3=RAND() |
| 42 | 3나눗셈③ | visible | Sheet77 | A1:P34 | 174 | VLOOKUP:116, INDEX:58, RANK:58 | 3나눗셈③원본(174) |  | third분수C_문제, third나눗셈C_답, 문제바꾸기, 인쇄 | D5=VLOOKUP(B5,'3나눗셈③원본'!$A$1:$B$58,2,FALSE)<br>G5=VLOOKUP(E5,'3나눗셈③원본'!$A$1:$B$58,2,FALSE)<br>I5=INDEX('3나눗셈③원본'!$A$1:$A$58,RANK('3나눗셈③원본'!C1,'3나눗셈③원본'!$C$1:$C$58,1)) |
| 43 | 3분수① | visible | Sheet23 | B1:P37 | 105 | RANDBETWEEN:45, RIGHT:40, IF:20, OR:20 |  | D3:D4, D6:D7, D9:D10, D12:D13, D15:D16, H3, H6, H9, H12, H15, L3:L4, L6:L7, L9:L10, L12:L13, L15:L16, L19:L20, L22:L23, L25:L26, L28:L29, L31:L32, P3, P6, P9, P12, P15, P19, P22, P25, P28, P31 | third분수_답, third분수_문제, 문제바꾸기, 인쇄 | B3=H3*D4<br>D3=RANDBETWEEN(1,8)<br>E3=IF(OR(D3=1,D3=3,D3=6,D3=7,D3=8),"은","는") |
| 44 | 분수만들기 | hidden | Sheet51 | A1:V11 | 16 | RANK:8, RAND:8 |  | B4:B11 |  | A4=RANK(B4,$B$4:$B$11)<br>B4=RAND()<br>A5=RANK(B5,$B$4:$B$11) |
| 45 | 3분수② | visible | Sheet52 | B1:M27 | 80 | INDEX:32, RANDBETWEEN:24, QUOTIENT:8 | 분수만들기(32) | B4, B7, B10, B13, B16, B19, B22, B25, C4, C7, C10, C13, C16, C19, C22, C25, J4, J7, J10, J13, J16, J19, J22, J25 | third분수B_답, third분수B_문제, 문제바꾸기, 인쇄 | B4=RANDBETWEEN(1,5)<br>C4=INDEX(분수만들기!$D$4:$I$11,분수만들기!A4,RANDBETWEEN(1,6))<br>F4=B4*C5+C4 |
| 46 | 3무게,들이 | visible | Sheet11 | A1:O43 | 66 | IF:50, RANDBETWEEN:40, AND:11, RIGHT:8 |  | B3:B4, B8:B9, B18:B19, D3:D4, D8:D9, D18:D19, G3:G4, G8:G9, G18:G19, I3:I4, I8:I9, I18:I19, L3:L4, L8:L9, L18:L19, N3:N4, N8:N9, N18:N19 | 무게들이_문제, 문제바꾸기, 무게들이_답, 인쇄 | B2=IF(AND(D3+D4>=1000,RIGHT(B3,1)+RIGHT(B4,1)>=10),"  1 1 ",IF(D3+D4>=1000,"  1",IF(RIGHT(B3,1)+RIGHT(B4,1)>=10,"1  ","")))<br>B3=RANDBETWEEN(1,9)<br>D3=RANDBETWEEN(1,666) |
| 47 | 3분수③ | visible | Sheet30 | A1:Q29 | 51 | IF:104, RANDBETWEEN:58, INDEX:56, RAND:9, RANK:8, VLOOKUP:8 |  | A21, A24, B3:B4, B6:B7, B9:B10, B12:B13, B15:B16, B18:B19, B21:B22, B24:B25, I3:I11 | third단위_답, third단위_문제, 문제바꾸기, 인쇄 | B3=RANDBETWEEN(1,B4-1)<br>C3=INDEX($H$3:$I$11,RANK(I3,$I$3:$I$11),1)<br>E3=IF(C3="년",12*B3/B4,IF(C3="일",24*B3/B4,IF(C3="시간",60*B3/B4,IF(C3="분",60*B3/B4,IF(C3="t",1000*B3/B4,IF(C3="kg",1000*B3/B4,IF(C3="km",1000*B3/B4,IF(C3="m",100*B3/B4,1000*B3/B4)))))))) |
| 48 | 4숫자읽기 | visible | Sheet25 | A1:M37 | 20 | INDEX:10, RANDBETWEEN:10, VLOOKUP:10 | 큰수원본(20) | B3, B6, B9, B12, B15, B20, B23, B26, B29, B32 | 문제바꾸기, fourth큰수_답, fourth큰수_문제, 문제지선택, 인쇄 | B3=INDEX(큰수원본!$A$1:$A$11,RANDBETWEEN(1,2),1)<br>B4=VLOOKUP(B3,큰수원본!$A$1:$B$11,2,FALSE)<br>B6=INDEX(큰수원본!$A$1:$A$11,RANDBETWEEN(3,4),1) |
| 49 | 큰수원본 | hidden | Sheet26 | A1:AJ35 | 590 | MID:481, IFERROR:283, CHOOSE:283, RANDBETWEEN:251, INDEX:250, IF:245, AND:47, CONCATENATE:31 |  | A1:A11, A13:A24, A28:A35 |  | A1=1000000000000000*INDEX($C$26:$V$26,1,RANDBETWEEN(10,20))+100000000000000*INDEX($C$26:$V$26,1,RANDBETWEEN(1,20))+10000000000000*INDEX($C$26:$V$26,1,RANDBETWEEN(1,20))+1000000000000*INDEX($C$26:$V$26,1,RANDBETWEEN(1,20))+100000000000*INDEX($C$26:$V$26,1,RANDBETWEEN(1,20))+10000000000*INDEX($C$26:$V$26,1,RANDBETWEEN(1,20))+1000000000*INDEX($C$26:$V$26,1,RANDBETWEEN(1,20))+100000000*INDEX($C$26:$V$26,1,RANDBETWEEN(1,20))+10000000*INDEX($C$26:$V$26,1,RANDBETWEEN(1,20))+1000000*INDEX($C$26:$V$26,1,RANDBETWEEN(1,20))+100000*INDEX($C$26:$V$26,1,RANDBETWEEN(1,20))+10000*INDEX($C$26:$V$26,1,RANDBETWEEN(1,20))+1000*INDEX($C$26:$V$26,1,RANDBETWEEN(1,20))+100*INDEX($C$26:$V$26,1,RANDBETWEEN(1,20))+10*INDEX($C$26:$V$26,1,RANDBETWEEN(1,20))+INDEX($C$26:$V$26,1,RANDBETWEEN(1,20))<br>B1=CONCATENATE(C1,D1,E1,F1,G1,H1,I1,J1,K1,L1,M1,N1,O1,P1,Q1,R1,S1,T1,U1,V1,W1,X1,Y1,Z1,AA1,AB1,AC1,AD1,AE1,AF1,AG1,AH1,AI1,AJ1)<br>C1=IFERROR(CHOOSE(MID(A1,1,1),"","이","삼","사","오","육","칠","팔","구"),"") |
| 50 | 4곱셈 | visible | Sheet18 | A1:O32 | 33 | RANDBETWEEN:27 |  | B4, B6, B12:B13, B18:B19, B24:B25, D4, D6, F12:F13, F18:F19, F24:F25, J12:J13, J18:J19, J24:J25 | fourth곱셈_답, fourth곱셈_문제, 문제바꾸기, 인쇄 | B4=RANDBETWEEN(2,6)*10^RANDBETWEEN(1,3)<br>D4=RANDBETWEEN(2,6)*10^RANDBETWEEN(2,3)<br>F4=B4*D4 |
| 51 | 큰수곱셈원본 | hidden | Sheet5 | A3:H42 | 190 | RANDBETWEEN:85, RANK:38, RAND:38, IF:18 |  | B4:B41, C4:C41, E4:E41 |  | A4=RANK(B4,$B$4:$B$41)<br>B4=RAND()<br>C4=RANDBETWEEN(2,9) |
| 52 | 4큰수곱셈 | visible | Sheet67 | A1:I37 | 60 | INDEX:60 | 큰수곱셈원본(60) |  | 문제바꾸기, fourth큰수곱셈_답, fourth큰수곱셈_문제, 인쇄 | B2=INDEX(큰수곱셈원본!$C$4:$C$41,큰수곱셈원본!A4)<br>C2=INDEX(큰수곱셈원본!$D$4:$D$41,큰수곱셈원본!A4)<br>E2=INDEX(큰수곱셈원본!$E$4:$E$41,큰수곱셈원본!A4) |
| 53 | 4나눗셈 | visible | Sheet4 | A1:K42 | 82 | QUOTIENT:32, RANDBETWEEN:27, LEFT:20, IF:15, MOD:12 |  | B6, B15, B24, B32, C6, C15, C24, C32, E6, E15, E24, E32, F6, F15, F24, F32, H6, H15, H24, H32, I6, I15, I24, I32 | fourth나눗셈_문제, fourth나눗셈_답, 문제바꾸기, 인쇄 | C5=QUOTIENT(C6,B6)<br>D5="…"&MOD(C6,B6)<br>F5=IF(E6>F8,QUOTIENT(LEFT(F6,2),E6)*10,QUOTIENT(LEFT(F6,2),E6)*10+QUOTIENT(F8,E6)) |
| 54 | 4분수 | visible | Sheet2 | A1:T55 | 106 | RANDBETWEEN:45, IF:12 |  | B3, B9, B13, B18, B23, B28, B33, B38, B43, B48, C3, C5, C13, C15, C18, C20, C23, C25, C33, C35, C38, C40, C43, C45, C48, C50, D8, D28, E4, E8, E10, E13, E18, E23, E28, E30, E33, E38, E43, E48, F13, F23, F38, F43, F48 | 문제바꾸기, fourth분수_답, fourth분수_문제, 인쇄 | B3=RANDBETWEEN(2,9)<br>C3=RANDBETWEEN(1,C5-1)<br>H3=C3 |
| 55 | 분수원본 | hidden | Sheet19 | A1:Q35 | 0 |  |  |  |  |  |
| 56 | 약수원본 | hidden | Sheet39 | A2:Z45 | 300 | RANK:123, INDEX:82, RAND:56, LCM:40, GCD:21 |  | B3:B23, B26:B45, H2, I2, J2, K2, L2, M2, N2, O2, P2, Q2, R2, S2, T2, U2, V2 |  | H2=RAND()<br>I2=RAND()<br>J2=RAND() |
| 57 | 혼합계산원본 | hidden | Sheet54 | A1:D215 | 430 | RAND:215, RANK:215 |  | A1:A215 |  | A1=RAND()<br>B1=RANK(A1,$A$1:$A$215)<br>A2=RAND() |
| 58 | 4소수 | visible | Sheet10 | A1:N34 | 24 | RANDBETWEEN:16 |  | B3, B9, B15, B21, D3, D9, D15, D21, I3, I9, I15, I21, K3, K9, K15, K21 | fourth소수_답, fourth소수_문제, 문제바꾸기, 인쇄 | B3=RANDBETWEEN(1,9999)/100<br>D3=RANDBETWEEN(1,B3*100-1)/100<br>F3=B3-D3 |
| 59 | 소인수식 | hidden | Sheet58 | A2:D85 | 168 | RANK:84, RAND:84 |  | B2:B85 |  | A2=RANK(B2,$B$2:$B$85)<br>B2=RAND()<br>A3=RANK(B3,$B$2:$B$85) |
| 60 | 단위변환 | visible | Sheet29 | A1:N26 | 40 | RANDBETWEEN:50, IF:17, INDEX:9, RIGHT:4, LEFT:3, LEN:1 |  | B20, B24, C2, C4, C6, C8, C10, C24, E2, E4, E6, E8, E10, E12, E14, E16, E18, E22, F12, F14, F16, G18, G22, I18, I22, K18 | fourth단위_답, fourth단위_문제, 문제바꾸기, 인쇄 | B2=IF(C2=$I$12,E2/1000000,IF(C2=$J$12,E2/1000,E2/10))<br>C2=INDEX($H$9:$J$9,1,RANDBETWEEN(1,3))<br>E2=RANDBETWEEN(1,19) |
| 61 | 5혼합계산 | visible | Sheet53 | A1:I37 | 16 | INDEX:16 | 혼합계산원본(16) |  | 문제바꾸기, fourth혼합계산_답, fourth혼합계산_문제, 문제지선택, 인쇄 | B2=INDEX(혼합계산원본!$C$1:$C$215,혼합계산원본!B1,1)& " ="<br>E2=INDEX(혼합계산원본!$D$1:$D$215,혼합계산원본!B1,1)<br>B4=INDEX(혼합계산원본!$C$1:$C$215,혼합계산원본!B2,1)& " =" |
| 62 | 자연수분해 | visible | Sheet57 | A1:O36 | 30 | INDEX:30 | 소인수식(30) |  | 문제바꾸기, fifth소인수분해_답, fifth소인수분해_문제, 인쇄 | B3=INDEX(소인수식!$C$2:$C$85,소인수식!$A2)<br>L3=INDEX(소인수식!$C$2:$C$85,소인수식!$A10)<br>B4=INDEX(소인수식!$D$2:$D$85,소인수식!$A2) |
| 63 | 프라임넘버 | visible | Sheet66 | B2:K13 | 0 |  |  |  | fifth소수찾기_답, fifth소수찾기_문제, 인쇄 |  |
| 64 | 5약수,배수 | visible | Sheet38 | A1:Q28 | 90 | INDEX:90 | 약수원본(90) |  | 문제바꾸기, first덧셈뺄셈2_답, first덧셈뺄셈2_문제, 인쇄 | A3=INDEX(약수원본!$C$3:$C$23,약수원본!$A$3,1)<br>C3=INDEX(약수원본!$D$3:$D$23,약수원본!$A$3,1)<br>E3=INDEX(약수원본!$E$3:$E$23,약수원본!$A$3,1) |
| 65 | 5분수① | visible | Sheet9 | A1:AA92 | 130 | IF:64, RANDBETWEEN:54, HLOOKUP:32, GCD:30, INT:18, QUOTIENT:18, LCM:10, MOD:8, AND:6, INDEX:4 | 분수원본(36) | B5, B8, B14, B17, B23, B26, B32, B35, B41, B44, B50, B53, B59, B62, B68, B71, B80, B89, D5, D8, D14, D17, D23, D26, D32, D35, D41, D44, D50, D53, D59, D62, D68, D71, D77, D86, F41, F44, F50, F53, F59, F62, F68, F71 | fifth분수A_문제, fifth분수A_답, 문제바꾸기, 인쇄 | B5=HLOOKUP(B8,분수원본!$B$1:$M$15,RANDBETWEEN(2,8),FALSE)<br>D5=HLOOKUP(D8,분수원본!$B$1:$M$15,RANDBETWEEN(2,8),FALSE)<br>F5=B5*F8/B8 |
| 66 | 5분수② | visible | Sheet3 | B1:AF114 | 210 | IF:110, RANDBETWEEN:70, GCD:54, HLOOKUP:42, QUOTIENT:24, AND:14, LCM:14, MOD:8, INDEX:6 | 분수원본(48) | B5, B14, B23, B32, B41, B50, B59, B68, B77, B86, C5, C8, C14, C17, C23, C26, C32, C35, C41, C44, C50, C53, C59, C62, C68, C71, C77, C80, C86, C89, E5, E14, E23, E32, E41, E44, E50, E53, E59, E62, E68, E71, E77, E86, F5, F8, F14, F17, F23, F26, F32, F35, F77, F80, F86, F89, G41, G44, G50, G53, G59, G62, G68, G71, H77, H86, I77, I80, I86, I89 | fifth분수B_답, 문제바꾸기, fifth분수B_문제, 인쇄 | B5=RANDBETWEEN(1,9)<br>C5=HLOOKUP(C8,분수원본!$B$1:$M$15,RANDBETWEEN(2,8),FALSE)<br>E5=RANDBETWEEN(1,9) |
| 67 | 분수대소데이터 | hidden | Sheet37 | A1:H11 | 0 |  |  |  |  |  |
| 68 | 5분수③ | visible | Sheet79 | A1:Y92 | 50 |  | 분수대소데이터(50) |  | fifth분수대소_문제, fifth분수대소_답, fifth분수대소데이터, 인쇄 | C5=분수대소데이터!B2<br>D5=분수대소데이터!H2<br>E5=분수대소데이터!E2 |
| 69 | 5소수 | visible | Sheet65 | A1:X31 | 27 | RANDBETWEEN:36 |  | A3, A12, A22, C3, C12, C22, G3, G12, G22, I3, I12, I22, M3, M12, M22, O3, O12, O22 | 문제바꾸기, fifth소수_문제, fifth소수_답, 인쇄 | A3=RANDBETWEEN(77,99)/(10^(RANDBETWEEN(0,2)))<br>C3=RANDBETWEEN(77,99)/(10^(RANDBETWEEN(0,2)))<br>E3=A3*C3 |
| 70 | 6분수 | visible | Sheet64 | A1:AA104 | 130 | IF:68, RANDBETWEEN:53, HLOOKUP:32, GCD:30, QUOTIENT:17, INT:14, LCM:10, MOD:8, AND:6, INDEX:4 | 분수원본(36) | B5, B8, B14, B17, B23, B26, B32, B35, B41, B44, B50, B53, B59, B62, B68, B71, B80, B89, D5, D8, D14, D17, D23, D26, D32, D35, D41, D44, D50, D53, D59, D62, D68, D71, D77, D86, F41, F44, F50, F53, F59, F62, F68, F71 | fifth분수A_문제, fifth분수A_답, 문제바꾸기, 문제지선택, 인쇄 | B5=HLOOKUP(B8,분수원본!$B$1:$M$15,RANDBETWEEN(2,8),FALSE)<br>D5=HLOOKUP(D8,분수원본!$B$1:$M$15,RANDBETWEEN(2,8),FALSE)<br>F5=B5*F8/B8 |
| 71 | 6소수① | visible | Sheet81 | A1:I36 | 54 |  | 6자연수원본(54) |  | sixth소수A_문제, sixth소수A_답, sixth소수A_새로고침, 인쇄 | C5='6자연수원본'!D2<br>F5='6자연수원본'!D3<br>I5='6자연수원본'!D4 |
| 72 | 6자연수원본 | hidden | Sheet80 | A1:D19 | 0 |  |  |  |  |  |
| 73 | 6소수② | visible | Sheet17 | A1:X30 | 36 | RANDBETWEEN:32 |  | A2, A12, A22, C2, C12, C22, G2, G12, G22, I2, I12, I22, M2, M12, M22, O2, O12, O22, S2, S12, S22, U2, U12, U22 | 문제바꾸기, fifth소수_문제, fifth소수_답, 인쇄 | A2=RANDBETWEEN(77,99)/(10^(RANDBETWEEN(0,2)))<br>C2=RANDBETWEEN(77,99)/(10^(RANDBETWEEN(0,2)))<br>E2=A2*C2 |
| 74 | 6소수③ | visible | Sheet21 | A1:X30 | 40 | RANDBETWEEN:24, INT:8 |  | A3, A12, A22, C3, C12, C22, G3, G12, G22, I3, I12, I22, M3, M12, M22, O3, O12, O22, S3, S12, S22, U3, U12, U22 | 문제바꾸기, fifth소수_문제, fifth소수_답, 인쇄 | A3=RANDBETWEEN(1,99)<br>C3=RANDBETWEEN(1,99)/100<br>E3=A3/C3 |
| 75 | 6혼합계산 | visible | Sheet22 | A1:AA48 | 79 | RANDBETWEEN:31, INT:28, GCD:22, IF:22, LCM:18, QUOTIENT:10, HLOOKUP:9, INDEX:3, IFERROR:1 | 분수원본(10) | B5, B11, B18, B25, B32, B39, C4, C6, C17, C19, C33, C38, C40, E5, E11, E17, E19, E25, E32, E39, F4, F6, F26, G18, H4, H6, H12, H26, H33, H40 | sixth혼합계산_답, sixth혼합계산_문제, 문제바꾸기, 인쇄 | C4=RANDBETWEEN(2,6)<br>F4=HLOOKUP(H6,분수원본!$B$18:$Q$35,RANDBETWEEN(13,15),FALSE)<br>H4=HLOOKUP(C6,분수원본!$B$18:$Q$35,RANDBETWEEN(13,15),FALSE) |
| 76 | 6비례식 | visible | Sheet55 | A1:N36 | 24 | INDEX:22 | 비례식원본(22) |  | sixth비례식_답, sixth비례식_문제, 문제바꾸기, 인쇄 | B2=INDEX(비례식원본!$C$1:$C$30,비례식원본!B1)<br>J2=INDEX(비례식원본!$C$1:$C$30,비례식원본!B2)<br>B3=INDEX(비례식원본!$D$1:$D$30,비례식원본!B1) |
| 77 | 비례식원본 | hidden | Sheet56 | A1:N30 | 60 | RAND:30, RANK:30 |  | A1:A30 |  | A1=RAND()<br>B1=RANK(A1,$A$1:$A$30)<br>A2=RAND() |
| 78 | 6원 | visible | Sheet20 | A1:H35 | 16 | RANDBETWEEN:8, LEFT:8 |  | B3, B11, B19, B27, F3, F11, F19, F27 | 문제바꾸기, sixth원평면_답, sixth원평면_문제, 인쇄 | B3=RANDBETWEEN(1,5)&"cm"<br>F3=RANDBETWEEN(1,5)&"mm"<br>B4=LEFT(B3,1)*2*3.14&"cm" |
| 79 | 6원기둥 | visible | Sheet15 | A1:H35 | 16 | LEFT:20, RANDBETWEEN:8 |  | C3:C4, C11:C12, C19:C20, C27:C28 | sixth원입체_답, sixth원입체_문제, 문제바꾸기, 인쇄 | C3=RANDBETWEEN(1,9)&"cm"<br>C4=RANDBETWEEN(1,9)&"cm"<br>C5=LEFT(C3,1)^2*6.28+LEFT(C3,1)*6.28*LEFT(C4,1)&"cm²" |
| 80 | 19단원본 | hidden | Sheet47 | A1:C30 | 90 | RANDBETWEEN:32, RANK:30, RAND:30 |  | B1:B30, C1:C30 |  | A1=RANK(C1,$C$1:$C$30)<br>B1="11×"&RANDBETWEEN(11,13)&"="<br>C1=RAND() |
| 81 | 종류 | hidden | Sheet28 | B3:H9 | 0 |  |  |  |  |  |

## 4. 숨김 시트와 표시 시트의 의존관계

| 숨김 시트 | 코드명 | 범위 | 수식 | 표시 시트 종속 | 역할 |
| --- | --- | --- | --- | --- | --- |
| 연습일지 | Sheet27 | A1:N47 | 40 | 정적 수식 종속 없음 | 수식/정적 데이터 원본 |
| 뛰어세기원본 | Sheet48 | A1:E10 | 50 | 1뛰어세기(20셀) | 수식/정적 데이터 원본 |
| 수읽기문제 | Sheet61 | A2:Z23 | 76 | 1수읽기(36셀) | 수식/정적 데이터 원본 |
| 구구단원본 | Sheet24 | A1:L100 | 425 | 2구구단①(18셀), 2구구단②(18셀), 2구구단③(18셀), 2구구단④(18셀), 2구구단⑤(100셀) | 수식/정적 데이터 원본 |
| 3나눗셈③원본 | Sheet78 | A1:C58 | 58 | 3나눗셈③(174셀) | 수식/정적 데이터 원본 |
| 분수만들기 | Sheet51 | A1:V11 | 16 | 3분수②(32셀) | 수식/정적 데이터 원본 |
| 큰수원본 | Sheet26 | A1:AJ35 | 590 | 4숫자읽기(20셀) | 수식/정적 데이터 원본 |
| 큰수곱셈원본 | Sheet5 | A3:H42 | 190 | 4큰수곱셈(60셀) | 수식/정적 데이터 원본 |
| 분수원본 | Sheet19 | A1:Q35 | 0 | 5분수①(36셀), 5분수②(48셀), 6분수(36셀), 6혼합계산(10셀) | 수식/정적 데이터 원본 |
| 약수원본 | Sheet39 | A2:Z45 | 300 | 5약수,배수(90셀) | 수식/정적 데이터 원본 |
| 혼합계산원본 | Sheet54 | A1:D215 | 430 | 5혼합계산(16셀) | 수식/정적 데이터 원본 |
| 소인수식 | Sheet58 | A2:D85 | 168 | 자연수분해(30셀) | 수식/정적 데이터 원본 |
| 분수대소데이터 | Sheet37 | A1:H11 | 0 | 5분수③(50셀) | VBA 기록 대상 |
| 6자연수원본 | Sheet80 | A1:D19 | 0 | 6소수①(54셀) | VBA 기록 대상 |
| 비례식원본 | Sheet56 | A1:N30 | 60 | 6비례식(22셀) | 수식/정적 데이터 원본 |
| 19단원본 | Sheet47 | A1:C30 | 90 | 19단(30셀) | 수식/정적 데이터 원본 |
| 종류 | Sheet28 | B3:H9 | 0 | 정적 수식 종속 없음 | 수식/정적 데이터 원본 |

주요 흐름은 다음과 같다.

```text
[새 문제 버튼] -> Module4.문제바꾸기 -> Excel 전체 Calculate
    -> RAND/RANDBETWEEN 재평가
    -> 숨김 원본의 RANK/INDEX 순서 재편성
    -> 표시 시트 문제 셀과 정답 셀 동시 갱신
    -> *_문제 프로시저: 정답 범위 글자색/테두리 숨김
    -> *_답 프로시저: 같은 범위 글자색/테두리 표시
```

`Calculate`가 시트나 범위로 한정되지 않았기 때문에 한 시트의 새 문제 버튼을 눌러도 통합문서 전체의 휘발성 수식이 재계산된다. 웹에서는 이 전역 동작을 그대로 복제할지, 현재 문제만 재생성할지 결정해야 한다.

### 특수 VBA 데이터 생성 흐름

| 사용자 동작 | VBA 근거 | 중간 출력 | 표시 출력 |
| --- | --- | --- | --- |
| 5분수③ 데이터 새로 생성 | Module10.fifth분수대소데이터, 2-135행; GetVbaGcd 137-142행; RandBetween 144-146행 | 분수대소데이터!A1:H11을 지우고 10개 비교 문제 기록 | 5분수③!C5:E32 등 50개 직접 참조 수식 |
| 6소수① 새로고침 | Module1.sixth소수A_새로고침, 38-130행 | 6자연수원본!A1:D19을 지우고 18개 나눗셈·정답 기록 | 6소수①!C5:I35의 54개 직접 참조 수식 |
| 문제 선택 | Module35.문제지선택, 3-5행 | UserForm 문제선택 표시 | 각 Click 이벤트가 ThisWorkbook.Sheets(이름).Select 후 폼 닫기 |
| 인쇄 | Module20.인쇄, 2-6행 | Application.Dialogs(xlDialogPrint).Show | Excel 인쇄 대화상자 |

## 5. 셀 입력과 출력 의존성

| 시트 | 잠금 해제 빈 셀 | 잠금 해제 값 셀 | 수식 종속 |
| --- | --- | --- | --- |
| 2시계① |  | B9=0.4791666666666667; E9=0.052083333333333336; H9=0.23611111111111113; B11='열한 시 삼십 분'; E11='한 시 십오 분'; H11='다섯 시 사십 분'; B21=0.20486111111111113; E21=0.5; H21=0.2951388888888889; B23='네 시 오십오 분'; E23='열두 시'; H23='일곱 시 오 분'; B32=0.2777777777777778; E32=0.4826388888888889; H32=0.041666666666666664; B34='여섯 시 사십 분'; E34='열한 시 삼십오 분'; H34='한 시' | 해당 시트 수식에서 직접 참조되지 않음 |
| 3분수② | H4:H26, I4:I26, K5:K6, K8:K9, K11:K12, K14:K15, K17:K18, K20:K21, K23:K24, K26 | K4='='; K7='='; K10='='; K13='='; K16='='; K19='='; K22='='; K25='=' | 해당 시트 수식에서 직접 참조되지 않음 |

따라서 대부분의 사용자는 셀 값을 넣지 않고 버튼을 입력으로 사용한다. `2시계①`의 18개 잠금 해제 값 셀과 `3분수②!H4:I26, K4:K26`의 잠금 해제 작업 영역은 로컬 수식에 직접 연결되지 않는다. 웹에서는 이 영역을 답안 입력 또는 필기 캔버스로 만들지, 단순 표시로 둘지 별도 결정이 필요하다.

## 6. 이름 정의, 표, 데이터 유효성, 조건부서식

| 종류 | 결과 | 근거 |
| --- | --- | --- |
| 정의 이름 | _xleta.T 1개 | 숨김=1, xlm=1, 정의식=#NAME? |
| Excel 표 | 없음 | xl/tables 파트와 시트 table 관계가 모두 없음 |
| 데이터 유효성 | 없음 | 81개 시트의 dataValidation 요소 0개 |
| 조건부서식 | 8개 범위, 10개 규칙 | 일부 문제/답 프로시저가 추가·삭제·테두리 변경 |

| 시트 | 범위 | 형식 | 수식 | 우선순위 |
| --- | --- | --- | --- | --- |
| 연습일지 | D5:D43 | cellIs | 0 | 1 |
| 4분수 | L13:L14 | expression | $L$13<>"" | 2 |
| 4분수 | L13:L14 | expression | L13<>"" | 5 |
| 4분수 | L18:L19 | expression | L18<>"" | 4 |
| 4분수 | L23:L24 | expression | $L$23<>"" | 1 |
| 4분수 | L23:L24 | expression | L23<>"" | 3 |
| 6혼합계산 | N4:N5 | expression | $N$4<>"" | 4 |
| 6혼합계산 | T17:T18 | expression | $T$17<>"" | 3 |
| 6혼합계산 | N17:N18 | expression | $N$17<>"" | 2 |
| 6혼합계산 | N42:N43 | expression | $N$42<>"" | 1 |

## 7. VBA 전수 조사

### 모듈 구성

| 구분 | 수 | 확인 결과 |
| --- | --- | --- |
| 표준 모듈 | 49 | 문제/답 표시, 전체 재계산, 특수 난수 데이터 생성, 인쇄, 폼 표시 |
| 시트 모듈 | 81 | Sheet27만 활성 이벤트 코드가 있고 나머지는 선언부만 존재 |
| ThisWorkbook | 1 | Workbook_BeforeSave가 주석 처리되어 자동 이벤트는 없음 |
| 클래스 모듈 | 0 | 없음 |
| UserForm | 1 | 문제선택; Caption 문자열은 2026-계상초등학교 |

### 표준 모듈 및 활성 문서 프로시저

| 모듈 종류 | 모듈 | 프로시저 | 코드 행 | 실제 효과 | 주요 Range 근거 |
| --- | --- | --- | --- | --- | --- |
| standard | Module4 | 문제바꾸기 | 6-14 | 전체 재계산 |  |
| standard | Module4 | fourth분수_답 | 16-111 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | G3:L11,H13:R51,G33:G36,G29:G30; G29; H3:H6,H8:H11,I13:I16,I18:I21,I23:I26,H28:H31; H28; H3:H6,H8:H11,I13:I16,I18:I21,I23:I26,H28:H31,H33:H36,I38:I41; I38; H3:H6,H8:H11,I13:I16,I18:I21,I23:I26,H28:H31,H33:H36,I38:I41,I43:I46,I48:I51,L43:L46,L48:L51; L48 |
| standard | Module4 | fourth분수_문제 | 112-137 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | G3:M11,H13:R51,G29:G36; G33; S17 |
| standard | Module6 | third나눗셈_문제 | 2-50 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | B7:H11; B7:H11,B15:H18; B15; B7:H11,B15:H18,B23:H26,B31:H34,B29,E29,H29,H21,E21,B21; B21; B7:H11,B15:H18,B23:H26,B31:H34,B29,E29,H29,H21,E21,B21,B13,E13,H13; H13; B7:H11,B15:H18,B23:H26,B31:H34,B29,E29,H29,H21,E21,B21,B13,E13,H13,H5,E5,B5 |
| standard | Module6 | third나눗셈_답 | 51-211 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | B5,E5,H5,B13,E13,H13,B7:H12; B7; B5,E5,H5,B13,E13,H13,B7:H12,B15:H21; B15; B5,E5,H5,B13,E13,H13,B7:H12,B15:H21,B23:H29; B23; B5,E5,H5,B13,E13,H13,B7:H12,B15:H21,B23:H29,B31:H36; B31 |
| standard | Module9 | 길이_답 | 2-26 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | 2:2,5:5,10:10; A10; 2:2,5:5,10:10,17:17; A17; 2:2,5:5,10:10,17:17,20:20,25:25; A25; M6 |
| standard | Module9 | 무게들이_답 | 27-43 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | 2:2,5:5,10:10; A10; 2:2,5:5,10:10,17:17,20:20,25:25; A25; f1 |
| standard | Module16 | 길이_문제 | 5-30 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | A2:O2,A5:O5,A7:O7,A10:O10; A10; A2:O2,A5:O5,A7:O7,A10:O10,A17:O17,A20:O20,A22:O23,O23; O23; A2:O2,A5:O5,A7:O7,A10:O10,A17:O17,A20:O20,A22:O22,A25:O25; A25; K3 |
| standard | Module16 | 무게들이_문제 | 31-47 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | A2:O2,A5:O5,A10:O10,A7:O7; A7; A2:O2,A5:O5,A10:O10,A7:O7,A17:O17,A20:O20,A22:O22,A25:O25; A25; f1 |
| standard | Module17 | 포함등분_답 | 2-34 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19; K19; I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19,I21:K21,I23,K23,I25:K25,I27,K27; K27; I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19,I21:K21,I23,K23,I25:K25,I27,K27,I29:K29,I31,K31; K31; I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19,I21:K21,I23,K23,I25:K25,I27,K27,I29:K29,I31,K31,I33:K33,I35:I36,K35:K36,I37:K37,I39:I40,K39:K40,I41:K41,I43:I44,K43:K44; K43 |
| standard | Module17 | 포함등분_문제 | 35-72 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19; K19; I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19,I21:K21,I23,K23,I25:K25,I27,K27; K27; I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19,I21:K21,I23,K23,I25:K25,I27,K27,I29:K29,I31,K31; K31; I5:K5,I7,K7,I9:K9,I11,K11,I13:K13,I15,K15,I17:K17,I19,K19,I21:K21,I23,K23,I25:K25,I27,K27,I29:K29,I31,K31,I33:K33,I35,K35; K35 |
| standard | Module18 | 십구단_문제 | 2-16 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B2:B11,E2:E11,H2:H11; H2; c1 |
| standard | Module18 | 십구단_답 | 17-32 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B2:B11; B2:B11,E2:E11,H2:H11; H2; c1 |
| standard | Module18 | sixth원입체_문제 | 33-55 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | C5:C6,C13:C14; C13; C5:C6,C13:C14,C21:C22; C21; C5:C6,C13:C14,C21:C22,C29:C30; C29; G7 |
| standard | Module18 | sixth원입체_답 | 56-92 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | C5:C6,C13:C14; C13; C5:C6,C13:C14,C21:C22; C21; C5:C6,C13:C14,C21:C22,C29:C30; C29; G6 |
| standard | Module19 | fifth소수_문제 | 2-17 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | f22,r22,l22,x22,Q22,K22,E22,w22,E12,K12,Q12,w12,Q2,K2,E2,w2,w22,q3,k3,e3,w3; E2; Q3 |
| standard | Module19 | fifth소수_답 | 18-35 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | f22,r22,l22,x22,E2,K2,Q2,w2,E12,K12,Q12,w12,Q22,K22,E22,w22,q3,k3,e3,w3; E2; Q3 |
| standard | Module20 | 인쇄 | 2-6 | 인쇄 대화상자, 폼 표시 |  |
| standard | Module21 | sixth원평면_답 | 2-24 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B3:B4,F3:F4,F11:F12,B11:B12; B11; B3:B4,F3:F4,F11:F12,B11:B12,B19:B20,F19:F20; F19; B3:B4,F3:F4,F11:F12,B11:B12,B19:B20,F19:F20,F27:F28,B27:B28; B27; G6 |
| standard | Module21 | sixth원평면_문제 | 25-47 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B4,F4,F12,B12; B12; B4,F4,F12,B12,B20,F20; F20; B4,F4,F12,B12,B20,F20,F28,B28; B28; F5 |
| standard | Module21 | fifth분수A_답 | 48-197 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | F5:L37; F5:L37,M5:M19; M5; F5:L37,M5:M19,H41:M91,F77:G91; F77; F5:F7,H5:H7,J5:J7,J14:J16,H14:H16,F14:F16,F23:F25,H23:H25,J23:J25; J23; F5:F7,H5:H7,J5:J7,J14:J16,H14:H16,F14:F16,F23:F25,H23:H25,J23:J25,F32:F34,H32:H34,J32:J34 |
| standard | Module21 | fifth분수A_문제 | 198-227 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | F5:N37; F5:N37,H41:I73,F77:M91; F77; S14 |
| standard | Module24 | third분수_답 | 2-48 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | L19:L20,L22:L23; L22; L19:L20,L22:L23,L25:L26,L28:L29,L31:L32; L31; L19:L20,L22:L23,L25:L26,L28:L29,L31:L32,O15:O16,O12:O13,O9:O10,O6:O7,O3:O4,F15:F16,F12:F13,F9:F10,F6:F7,F3:F4; F3; P3:P4 |
| standard | Module24 | third분수_문제 | 49-102 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | F3:F4,O3:O4,O6:O7,F6:F7,F9:F10,O9:O10,O12:O13,F12:F13,F15:F16,O15:O16,L19:L20,L22:L23; L22; F3:F4,O3:O4,O6:O7,F6:F7,F9:F10,O9:O10,O12:O13,F12:F13,F15:F16,O15:O16,L19:L20,L22:L23,L25:L26,L28:L29,L31:L32; L31; K19:M20,K22:M23,K25:M26,K28:M29,K31:M32; K32; P5 |
| standard | Module31 | fifth분수B_답 | 2-205 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | O5:O7,L5:L7,I5:I7,I14:I16,L14:L16,O14:O16,I23:I25,L23:L25,O23:O25,R23:R25,I32:I34,L32:L34,O32:O34,R32:R34; R32; O5:O7,L5:L7,I5:I7,I14:I16,L14:L16,O14:O16,I23:I25,L23:L25,O23:O25,R23:R25,I32:I34,L32:L34,O32:O34,R32:R34,L77:L79,O77:O79,R77:R79,U77:U79,L86:L88,O86:O88,R86:R88,U86:U88; U86; H5:AA91; AA89; H5:AB37,I41:J73; I41 |
| standard | Module31 | fifth분수B_문제 | 206-236 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | H5:X37; H5:X37,I41:P73; I41; H5:X37,I41:P73,K77:AA91; K77; b2 |
| standard | Module31 | sixth혼합계산_문제 | 237-275 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | J4:S12; J5; J4:S12,J17:T20; J17; J4:S12,J17:T20,K25:P29; K25; J4:S12,J17:T20,K25:P29,K32:R33,Q25:R26; Q25 |
| standard | Module31 | sixth혼합계산_답 | 276-370 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | K4:N7,K11:R12; K11; K4:N7,K11:R12,J17:T20; J17; K4:N7,K11:R12,J17:T20,K25:R26; K25; K4:N7,K11:R12,J17:T20,K25:R26,K32:R33; K32 |
| standard | Module33 | fourth큰수_문제 | 2-20 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B4:L4,B7:L7,B10:L10,B13:L13,B16:L16,B20; B20; B4:L4,B7:L7,B10:L10,B13:L13,B16:L16,B20,B23,B26,B29; B29; B4:L4,B7:L7,B10:L10,B13:L13,B16:L16,B20,B23,B26,B29,B32; B32; c1 |
| standard | Module33 | fourth큰수_답 | 21-39 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B4:L4,B7:L7,B10:L10,B13:L13,B16:L16,B20; B20; B4:L4,B7:L7,B10:L10,B13:L13,B16:L16,B20,B23; B23; B4:L4,B7:L7,B10:L10,B13:L13,B16:L16,B20,B23,B26,B29,B32; B32; c1 |
| document | Sheet27 | 입력_Click | 11-13 | 폼 표시 |  |
| standard | Module35 | 문제지선택 | 3-5 | 폼 표시 |  |
| standard | Module39 | fourth단위_문제 | 2-24 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E2,E4,E6,E8,E10,E12; E12; E2,E4,E6,E8,E10,E12,E14,E16; E16; E2,E4,E6,E8,E10,E12,E14,E16,E18,E20,E22,E24,G22,I22,I18,G18,K18; K18; H3 |
| standard | Module39 | fourth단위_답 | 25-44 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E2,E4,E6,E8,E10,E12,E14,E16; E16; E2,E4,E6,E8,E10,E12,E14,E16,E18,G18,I18,K18,I22,G22,E24,E22,E20; E20; H3 |
| standard | Module40 | first덧셈a_답 | 2-16 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E3:E21,K3:K21,M3,O5,M7,O9,M11,O13,M15,O17,M19,O21; O21; e1 |
| standard | Module40 | first덧셈a_문제 | 18-34 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E3:E21,O21,M19,O17,M15,O13,M11,O9,M7,O5; O5; E3:E21,O21,M19,O17,M15,O13,M11,O9,M7,O5,K3:K21,M3; M3; e1 |
| standard | Module41 | first보수_답 | 3-19 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E21,I21,S21,S19,S17,S15,S13,S11,S9,S7,S5,S3,G19,E19,E17,I17,G15,E15,E13,I13,G11,E11,E9,I9,G7,E7,E5,I5,G3,E3; E3 |
| standard | Module41 | first보수_문제 | 20-36 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E3,G3,E5,I5,G7,E7,E9,I9,G11,E11,E13,I13,G15,E15,E17,I17,G19,E19,E21,I21,S21,S19,S17,S15,S13,S11,S9,S7,S5,S3; S3; E3 |
| standard | Module42 | second덧셈_답 | 2-18 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B4:B5,D11:D12,D15:D16,B22:B23,F26:F27,F33:F34,D37:D38,F44:F45,M44:M45,P44:P45,R37:R38,I37:I38,M33:M34,T33:T34,P26:P27,K26:K27,K22:K23,T22:T23,P15:P16,I15:I16,M11:M12,P11:P12,R4:R5,K4:K5; K4; B4:B5 |
| standard | Module42 | second덧셈_문제 | 19-35 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B4:B5,D11:D12,D15:D16,B22:B23,F26:F27,F33:F34,D37:D38,F44:F45,M44:M45,P44:P45,R37:R38,I37:I38,T33:T34,M33:M34,K26:K27,P26:P27,T22:T23,K22:K23,I15:I16,P15:P16,P11:P12,M11:M12,K4:K5,R4:R5; R4; B4:B5 |
| standard | Module43 | first덧셈뺄셈2_답 | 2-29 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E3,E5,E7,E9,K9,K7,K5,K3,Q3,Q5,Q7,Q9,Q11,K11,E11; E11; E3,E5,E7,E9,K9,K7,K5,K3,Q3,Q5,Q7,Q9,Q11,K11,E11,E13,K13,Q13,Q15,Q17,Q19,K19,K17,K15,E15,E17,E19; E19; E3,E5,E7,E9,K9,K7,K5,K3,Q3,Q5,Q7,Q9,Q11,K11,E11,E13,K13,Q13,Q15,Q17,Q19,K19,K17,K15,E15,E17,E19,E21,K21,Q21; Q21; E3 |
| standard | Module43 | first덧셈뺄셈2_문제 | 30-51 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E3,K3,Q3,Q5,K5,K7,E7,E5,E9,K9,Q9,Q7,Q11,Q13,K13,K11,E11,E13; E13; E3,K3,Q3,Q5,K5,K7,E7,E5,E9,K9,Q9,Q7,Q11,Q13,K13,K11,E11,E13,E15,K15,Q15,Q17,Q19,Q21,K21,K19,K17,E17,E19,E21; E21; E3 |
| standard | Module44 | first뛰어세기_문제 | 3-19 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | F4,J4,H6,J6,L6,J8,H8,F8,F10,D10,H10,j10,F12,F14,J14,J12,N12,L16,J16,J18,H18,H16,F18,F20,H20,D20,j20,F22,J22,N22; N22; f1 |
| standard | Module45 | first뛰어세기_답 | 2-21 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | J22,F22,F20,H20,J20,N22,D20,F18,H18,J18,J16,H16,L16,J14,F14,F12,J12,N12; N12; J22,F22,F20,H20,J20,N22,D20,F18,H18,J18,J16,H16,L16,J14,F14,F12,J12,N12,J10,H10,F10,D10,F8,H8,J8,J6,H6,L6,J4,F4; F4; F1 |
| standard | Module45 | 구구단_답 | 22-54 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | C3:C22,F3:F22,I3:I22,L3:L22,O3:O22; O3; A2:O2 |
| standard | Module45 | 구구단_문제 | 55-77 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | E5,C3:C22,F3:F22,I3:I22,L3:L22,O3:O22; O3; A2:O2 |
| standard | Module46 | second구구단_답 | 2-22 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | Q21,O19,I19,K21,E21,C19,E17,E15,K17,K15,Q17,Q15:Q16,O13,I13,C13; C13; Q21,O19,I19,K21,E21,C19,E17,E15,K17,K15,Q17,Q15:Q16,O13,I13,C13,Q11,Q9,K11,K9,E11,E9,C7,E5,E3,I7,K5,K3,O7,Q5,Q3; Q3; E1:O1 |
| standard | Module46 | second구구단_문제 | 23-44 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | Q21,K21,E21,C19,I19,O19,Q17,K17,E17,E15,K15,Q15,O13,I13,C13,E11,K11,Q11; Q11; Q21,K21,E21,C19,I19,O19,Q17,K17,E17,E15,K15,Q15,O13,I13,C13,E11,K11,Q11,Q9,K9,E9,C7,I7,O7,Q5,Q3,K5,K3,E5,E3; E3; E1:O1 |
| standard | Module46 | first개수세기_답 | 47-80 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | A48:Y48; M47; J1:P1 |
| standard | Module47 | first딱지_답 | 2-35 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | A44:J45; A45; E43:F43; A44:J44; C1:G1 |
| standard | Module47 | first딱지_문제 | 36-57 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | A43:J45; C1:G1 |
| standard | Module49 | second개수세기_답 | 2-17 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | A42:Y42; A13 |
| standard | Module49 | second개수세기_문제 | 18-33 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | A42:Y42; A13 |
| standard | Module50 | third덧셈뺄셈_답 | 2-21 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B5,D5,F5,H5,H11,F11,D11,B11; B11; B5,D5,F5,H5,H11,F11,D11,B11,B17,D17,F17,H17,H23,F23,D23,B23; B23; B5 |
| standard | Module50 | third덧셈뺄셈_문제 | 22-40 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B5,D5,F5,H5,H11,F11,D11,B11,B17,D17,F17,H17; H17; B5,D5,F5,H5,H11,F11,D11,B11,B17,D17,F17,H17,H23,F23,D23,B23; B23; B5 |
| standard | Module51 | third곱셈1_문제 | 2-17 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B5,D5,F5,H5,H11,F11,D11,B11,B17,D17,F17,H17,H23,F23,D23,B23; B23; B5 |
| standard | Module51 | third곱셈1_답 | 18-32 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B23,D23,F23,H23,H17,F17,D17,B17,B11,D11,F11,H11,H5,F5,D5,B5; B5 |
| standard | Module53 | third분수B_답 | 2-39 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | F4:F5,F7:F8,F10:F11,F13:F14,F16:F17,F19:F21,F22:F23,F25:F26,L25:M26,L22:M23,L19:M20,L16:M17,L13:M14,L10:M11,L7:M8,L4:M5; M5; H3 |
| standard | Module53 | third분수B_문제 | 40-72 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | F4:F5,F7:F8,F10:F11,F13:F14,F16:F17,F19:F20,F22:F23,F25:F26,L25:M26,L22:M23,L19:M20,L16:M17,L13:M14,L10:M11,L7:M8,L4:M5; M5; H3 |
| standard | Module54 | first개수세기_문제 | 2-23 | 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 시트/범위 선택 | A46:Y48; J4 |
| standard | Module55 | third시간_답 | 2-16 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | G2,I2,H4,A9:M9,A14:M14,A19:M19,G24:M24,G28:M28; G28; G1 |
| standard | Module55 | third시간_문제 | 17-31 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | G2,I2,H4,A9:M9,A14:M14,A19:M19,G24:M24,G28:M28; G28; G1 |
| standard | Module55 | fourth곱셈_답 | 32-46 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | F2:G2,F4:G4,F6:G6,F8:G8,B14,F14,J14,J20,F20,B20,B26,F26,i26; i26; H2 |
| standard | Module55 | fourth곱셈_문제 | 47-61 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | F2:G2,F4:G4,F6:G6,F8:G8,B14,F14,J14,J20,F20,B20,B26,F26,i26; i26; H2 |
| standard | Module55 | fourth혼합계산_답 | 62-76 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E16,E14,E12,E10,E8,E6,E4,E2; E2; F2 |
| standard | Module55 | fourth혼합계산_문제 | 77-91 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E16,E14,E12,E10,E8,E6,E4,E2; E2; F2 |
| standard | Module57 | fifth소인수분해_답 | 2-20 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B4,L4,L7,B7,B10,L10,L13,B13; B13; B4,L4,L7,B7,B10,L10,L13,B13,B16,L16,L19,B19,B22,L22,B25; B25; A2:E2 |
| standard | Module57 | fifth소인수분해_문제 | 21-43 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B4,L4,L7,B7,B10,L10,L13,B13; B13; B4,L4,L7,B7,B10,L10,L13,B13,B16,L16,L19,B19,B22,L22; L22; B4,L4,L7,B7,B10,L10,L13,B13,B16,L16,L19,B19,B22,L22,B25; B25; A2:E2 |
| standard | Module58 | first개수_답 | 2-19 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B6,B9,B12,k6,k9,k12,b19,b22,b25; B25; B6 |
| standard | Module58 | first개수_문제 | 20-38 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B6,B9,B12,k6,k9,k12,b19,b22,b25; B25; B6 |
| standard | Module59 | 이름표숨기기 | 2-12 | 시트/범위 선택 | Picture 6 |
| standard | Module59 | 이름표넣기 | 13-23 | 시트/범위 선택 | Picture 6 |
| standard | Module59 | fourth나눗셈_답 | 24-38 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | C5:J5,C14:J14,C23:J23,C31:J31; C31; C5 |
| standard | Module59 | fourth나눗셈_문제 | 39-55 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | C5:D5,F5:G5,I5:J5,C14:D14,F14:G14,I14:J14,C23:D23,F23:G23,I23:J23,C31:D31,F31:G31,I31:J31; I31; C5 |
| standard | Module59 | fourth소수_답 | 56-70 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | F3,M3,F9,M9,F15,M15,F21,M21,F27,M27; M27; F3 |
| standard | Module59 | fourth소수_문제 | 71-85 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | F3,M3,M9,F9,F15,M15,F21,M21; M21; F3 |
| standard | Module60 | first읽기_답 | 2-17 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | D5,D7,D9,D11,D13,D15,D17,D19,D21,K5,K7,K9,K11,K13,K15,K17,K19,K21; K21; D5 |
| standard | Module60 | first읽기_문제 | 18-33 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | D5,D7,D9,D11,D13,D15,D17,D19,D21,K5,K6,K6,K7,K9,K11,K13,K15,K17,K19,K21; K21; D5 |
| standard | Module1 | first덧셈뺄셈4_답 | 2-18 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E3,E5,A7,E9,E11,C13,E15,E17,A19,C21,G3,I5,M3,M5,M7,G7,I9,K11,I13,G15,I17,I21,K19,O21,M19,M17,Q15,O13,M11,Q9; Q9; E3 |
| standard | Module1 | first덧셈뺄셈3_문제 | 19-35 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E3,E5,A7,E9,E11,C13,E15,E17,A19,C21,I21,K19,I17,G15,I13,K11,I9,G7,I5,G3,M3,M5,M7,Q9,M11,O13,Q15,M17,M19,O21; O21; E3 |
| standard | Module1 | sixth소수A_새로고침 | 38-130 | 난수 생성, 글자색으로 문제/답 표시 전환, 테두리/조건부서식 변경, 데이터 시트 초기화, 셀 값 기록 | A1:D1; A1:D |
| standard | Module2 | second시계A_답 | 2-17 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B9,E9,H9,H11,E11,B11,B21,E21,H21,H23,E23,B23,B32,E32,H32,H34,E34,B34; B34; B9 |
| standard | Module2 | second시계A_문제 | 18-32 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E9,E11,H9,H11,B21,B23,E21,E23,H21,H23,B32,B34,E32,E34,H32,H34; H34; B9 |
| standard | Module3 | fifth소수찾기_답 | 2-56 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | C4:D4,F4,H4:H5,J5:J6,B5,D5:D6,B7:B8,B10:B11,D8:D9,D11:D12,H13,J11:J12,H10,H7:H8,J9; J9; B4,C5:C13,B12:B13,B9,B6,E4:E13,D13,D10,D7,F5:G13,G4,H6,I4:I13,H12,H11,H9,J4,K4:K13,J13,J10,J8,J7; J7; B4 |
| standard | Module3 | fifth소수찾기_문제 | 58-86 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | B4:k13; B4 |
| standard | Module5 | third시간1_답 | 2-17 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | H24,G22,I22,H20,I18,G18,H16,G14,I14,H12,I10,G10,H8,G6,I6,H4,I2,G2; G2 |
| standard | Module5 | third시간1_문제 | 18-33 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | H24,I22,G22,H20,I18,G18,H16,I14,G14,H12,G10,I10,H8,I6,G6,H4,I2,G2; G2 |
| standard | Module7 | third덧셈뺄셈b_문제 | 2-17 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | f23,l23,L21,L19,F21,F19,F17,L17,L15,F15,F13,L13,L11,F11,F9,L9,L7,F7,F5,L5,L3,F3; F3 |
| standard | Module7 | third덧셈뺄셈b_답 | 18-33 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | f23,l23,L21,F21,F19,F17,F15,L19,L17,L15,L13,F13,F11,L11,L9,L7,L5,L3,F9,F7,F5,F3; F3 |
| standard | Module8 | third나눗셈B_답 | 2-17 | 글자색으로 문제/답 표시 전환, 시트 보호 전환, 시트/범위 선택 | F3:F22,H3:H22,N3:N22,P3:P22,V3:V19,X3:X19; x19; a2 |
| standard | Module8 | third나눗셈B_문제 | 18-33 | 글자색으로 문제/답 표시 전환, 시트 보호 전환, 시트/범위 선택 | X3:X19,V3:V19,P3:P22,N3:N22,H3:H22,F3:F22; f22; a1 |
| standard | Module11 | 제곱수_문제 | 2-16 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | C8:C16,G8:G16,K8:K16; K16; D8 |
| standard | Module11 | 제곱수_답 | 17-31 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | C8:C16,G8:G16,K8:K16; K16; C7 |
| standard | Module12 | sixth비례식_답 | 2-16 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E4:G4,L4,C12,K12,D19,F24,H29; F24; J6 |
| standard | Module12 | sixth비례식_문제 | 17-31 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E4:G4,L4,C12,K12,D19,F24,H29; F24; H7 |
| standard | Module13 | third빈칸_문제 | 2-18 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | K29,O27,P29,Q32,C8,D5,E3,I3,J8,K5,O5,P3,Q8,C13,D16,E11,I16,J11,K13,O11,P13,Q16,P19,O21,Q24,J24,K21,I19,E19,D21,C24,D32; C29,E27,I32,J27; Q32; G9 |
| standard | Module13 | third빈칸_답 | 19-35 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | J27,D32,C29,E27,C8,D5,E3,I3,K5,J8,O5,P3,Q8,O11,P13,Q16,I16,K13,J11,C13,E11,D16,C24,D21,E19,I19,J24,K21,O21,P19,Q24,Q32; P29,O27,I32,K29; E27; L9 |
| standard | Module13 | fourth큰수곱셈_답 | 36-50 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | H20,H18,H16,H14,H12,H10,H8,H6,H4,H2; H2; I5 |
| standard | Module13 | fourth큰수곱셈_문제 | 51-65 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | H20,H18,H16,H14,H12,H10,H8,H6,H4,H2; H2; J7 |
| standard | Module14 | second어림_답 | 2-16 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | M12,D18,D16,D14,D12,D10,D8,D6,D4; D4 |
| standard | Module14 | second어림_문제 | 17-31 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | D18,D16,D14,D12,D10,D8,D6,D4; D4 |
| standard | Module15 | third단위_답 | 2-16 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E24:E25,E21:E22,E18:E19,E15:E16,E12:E13,E9:E10,E6:E7,E3:E4; E3; E3:E4 |
| standard | Module15 | third단위_문제 | 17-31 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E24:E25,E21:E22,E18:E19,E15:E16,E12:E13,E9:E10,E6:E7,E3:E4; E3; E3:E4 |
| standard | Module22 | second덧셈뺄셈_답 | 2-18 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | E3,E7,E11,E15,E19,E23,E27,E31,E35,E39,J39,Q39,O35,L35,J31,O31,S27,Q23,H27,J23,L19,O19,S15,J15,H11,O11,O7,O3,J7,H3; H3; E3 |
| standard | Module22 | second덧셈뺄셈_문제 | 19-35 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | Q39,O35,O31,S27,Q23,O19,S15,O11,O7,O3,H3,J7,H11,J15,L19,J23,H27,J31,L35,J39,E39,E35,E31,E27,E23,E19,E15,E11,E7,E3; E3 |
| standard | Module23 | third곱셈_답 | 2-16 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | W21,T21,Q21,N21,N15,Q15,T15,W15,W9,T9,Q9,N9,N3,Q3,T3,W3; W3; N3 |
| standard | Module23 | third곱셈_문제 | 17-31 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | W21,T21,Q21,N21,N15,Q15,T15,W15,W9,T9,Q9,N9,N3,Q3,T3,W3; W3; N3 |
| standard | Module26 | third분수C_문제 | 2-16 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | N5:N33,K5:K33,G5:G33,D5:D33; A1 |
| standard | Module26 | third나눗셈C_답 | 17-31 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | N5:N33,K5:K33,G5:G33,D5:D33; A1 |
| standard | Module10 | fifth분수대소데이터 | 2-135 | 난수 생성, 데이터 시트 초기화, 셀 값 기록, 시트 생성, 계산 모드 변경 | A1:H1 |
| standard | Module10 | GetVbaGcd | 137-142 | 보조 계산 |  |
| standard | Module10 | RandBetween | 144-146 | 난수 생성 |  |
| standard | Module25 | fifth분수대소_문제 | 3-18 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | D7:D8,D16:D17,D25:D26,D34:D35,D43:D44,D52:D53,D61:D62,D70:D71,D79:D80,D88:D89; D88; A1 |
| standard | Module25 | fifth분수대소_답 | 20-36 | 글자색으로 문제/답 표시 전환, 시트/범위 선택 | D7:D8,D16:D17,D25:D26,D34:D35,D43:D44,D52:D53,D61:D62,D70:D71,D79:D80,D88:D89; D88; A1 |
| standard | Module27 | sixth소수A_답 | 2-17 | 글자색으로 문제/답 표시 전환 | C35,F35,I35,I29,F29,C29,C23,F23,I23,I17,F17,C17,C11,F11,I11,I5,F5,C5,a1; a1 |
| standard | Module27 | sixth소수A_문제 | 18-34 | 글자색으로 문제/답 표시 전환 | I35,F35,C35,C29,F29,I29,I23,F23,C23,C17,F17,I17,I11,F11,C11,I5,F5,C5,a1; a1 |

### UserForm 문제선택 이벤트

| 이벤트 | 코드 행 | 선택 시트 | 정적 판정 |
| --- | --- | --- | --- |
| C19_Click | 10-13 | 19단 | 정상 |
| c1덧a_Click | 14-17 | 1수세기① | 정상 |
| c1덧b_Click | 19-22 | 1덧셈뺄셈③ | 정상 |
| C2구_Click | 23-26 | 2구구단⑤ | 정상 |
| c2덧_Click | 28-31 | 2덧셈뺄셈① | 정상 |
| C3곱_Click | 33-36 | 3곱셈② | 정상 |
| C3길_Click | 38-41 | 3길이 | 정상 |
| C3나a_Click | 43-46 | 3나눗셈① | 정상 |
| C3나b_Click | 48-51 | 3나눗셈② | 정상 |
| C3무_Click | 53-56 | 3무게,들이 | 정상 |
| C3분_Click | 58-61 | 3분수① | 정상 |
| C3시_Click | 63-66 | 3시간 | 대상 시트 없음 |
| C4곱_Click | 68-71 | 4곱셈 | 정상 |
| C4단_Click | 73-76 | 단위변환 | 정상 |
| C4덧_Click | 78-81 | 4소수 | 정상 |
| C4분_Click | 83-86 | 4분수 | 정상 |
| C4숫_Click | 88-91 | 4숫자읽기 | 정상 |
| C5분a_Click | 93-96 | 5분수① | 정상 |
| C5분b_Click | 98-101 | 5분수② | 정상 |
| C5소_Click | 103-106 | 5소수 | 정상 |
| C6소_Click | 108-111 | 6소수 | 대상 시트 없음 |
| C6원a_Click | 113-116 | 6원 | 정상 |
| C6원b_Click | 118-121 | 6원기둥 | 정상 |
| C6혼_Click | 123-126 | 6혼합계산 | 정상 |
| C4나_Click | 128-131 | 4나눗셈 | 정상 |
| CommandButton1_Click | 133-136 | 1보수 | 정상 |
| CommandButton10_Click | 138-141 | 2구구단③ | 정상 |
| CommandButton11_Click | 143-146 | 2구구단④ | 정상 |
| CommandButton12_Click | 148-151 | 2길이재기 | 정상 |
| CommandButton13_Click | 153-156 | 2묶어세기 | 정상 |
| CommandButton14_Click | 158-161 | 3덧셈뺄셈 | 정상 |
| CommandButton15_Click | 163-166 | 3곱셈① | 정상 |
| CommandButton16_Click | 168-171 | 3분수② | 정상 |
| CommandButton17_Click | 173-176 | 5혼합계산 | 정상 |
| CommandButton18_Click | 178-181 | 6비례식 | 정상 |
| CommandButton19_Click | 183-186 | 5인수분해 | 대상 시트 없음 |
| CommandButton2_Click | 188-191 | 1덧셈뺄셈④ | 정상 |
| CommandButton20_Click | 193-196 | 1덧셈뺄셈① | 정상 |
| CommandButton21_Click | 198-201 | 1뛰어세기 | 정상 |
| CommandButton22_Click | 203-206 | 2시계① | 정상 |
| CommandButton23_Click | 208-211 | 6분수 | 정상 |
| CommandButton3_Click | 213-216 | 1덧셈뺄셈② | 정상 |
| CommandButton4_Click | 218-221 | 1수읽기 | 정상 |
| CommandButton5_Click | 223-226 | 1주고받기 | 정상 |
| CommandButton6_Click | 228-231 | 1수세기② | 대상 시트 없음 |
| CommandButton7_Click | 233-236 | 5약수,배수 | 정상 |
| CommandButton8_Click | 238-241 | 2구구단① | 정상 |
| CommandButton9_Click | 243-246 | 2구구단② | 정상 |
| C제_Click | 248-251 | 제곱수 | 정상 |
| Label8_Click | 253-255 |  | 정상 |

## 8. 사용자 버튼과 실제 호출 프로시저 전수 연결

버튼 자체의 VML Caption은 비어 있어 표시문구는 패키지에서 얻을 수 없었다. 아래 `매크로`가 실제 동작 근거이며, 위치는 VML/도형 앵커를 셀 주소로 환산한 근사 범위다.

| 시트 | 객체 | ID/이름 | 위치 | 배정 매크로 | 실제 프로시저 | 판정 |
| --- | --- | --- | --- | --- | --- | --- |
| 연습일지 | 폼 버튼 | _x0000_s179235 | D2:F3 | 현재시트저장 | 없음 | 끊김 |
| 연습일지 | 폼 버튼 | _x0000_s179236 | C2:D3 | 입력창띄워 | 없음 | 끊김 |
| 연습일지 | 폼 버튼 | _x0000_s179237 | K1:K2 | 일지제목바꾸기 | 없음 | 끊김 |
| 연습일지 | 폼 버튼 | _x0000_s179238 | F2:F3 | 일지초기화 | 없음 | 끊김 |
| 연습일지 | 폼 버튼 | _x0000_s179239 | A2:C3 | 문제지선택 | Module35.문제지선택(3-5) | 정상 |
| 연습일지 | 폼 버튼 | _x0000_s179240 | A45:C46 | 메모폼 | 없음 | 끊김 |
| 연습일지 | 도형/그림 | 2 | D1:E2 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 1수세기① | 폼 버튼 | _x0000_s564226 | N4:S5 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 1수세기① | 폼 버튼 | _x0000_s564227 | N1:S2 | first개수_답 | Module58.first개수_답(2-19) | 정상 |
| 1수세기① | 폼 버튼 | _x0000_s564228 | N3:S4 | first개수_문제 | Module58.first개수_문제(20-38) | 정상 |
| 1수세기① | 폼 버튼 | _x0000_s564229 | A2:C4 | 문제지선택 | Module35.문제지선택(3-5) | 정상 |
| 1수세기① | 도형/그림 | 2 | N1:N1 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 1덧셈뺄셈① | 폼 버튼 | _x0000_s217091 | P2:R3 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 1덧셈뺄셈① | 폼 버튼 | _x0000_s217089 | L2:M3 | first덧셈a_답 | Module40.first덧셈a_답(2-16) | 정상 |
| 1덧셈뺄셈① | 폼 버튼 | _x0000_s217090 | M2:O3 | first덧셈a_문제 | Module40.first덧셈a_문제(18-34) | 정상 |
| 1덧셈뺄셈① | 도형/그림 | 2 | L3:M4 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 1덧셈뺄셈① | 도형/그림 | 7 | L3:L3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 1덧셈뺄셈② | 폼 버튼 | _x0000_s280577 | L2:M3 | first덧셈a_답 | Module40.first덧셈a_답(2-16) | 정상 |
| 1덧셈뺄셈② | 폼 버튼 | _x0000_s280578 | M2:O3 | first덧셈a_문제 | Module40.first덧셈a_문제(18-34) | 정상 |
| 1덧셈뺄셈② | 폼 버튼 | _x0000_s280579 | P2:R3 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 1덧셈뺄셈② | 도형/그림 | 2 | L3:M4 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 1덧셈뺄셈② | 도형/그림 | 7 | L3:L3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 1주고받기 | 폼 버튼 | _x0000_s310274 | I3:J4 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 1주고받기 | 폼 버튼 | _x0000_s310275 | H3:I4 | first딱지_문제 | Module47.first딱지_문제(36-57) | 정상 |
| 1주고받기 | 폼 버튼 | _x0000_s310276 | G3:H4 | first딱지_답 | Module47.first딱지_답(2-35) | 정상 |
| 1주고받기 | 도형/그림 | 2 | F2:F2 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 1보수 | 폼 버튼 | _x0000_s140289 | L1:N2 | first보수_답 | Module41.first보수_답(3-19) | 정상 |
| 1보수 | 폼 버튼 | _x0000_s140290 | O1:R2 | first보수_문제 | Module41.first보수_문제(20-36) | 정상 |
| 1보수 | 폼 버튼 | _x0000_s140291 | R1:T2 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 1보수 | 도형/그림 | 7 | L3:L3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 1덧셈뺄셈③ | 폼 버튼 | _x0000_s248833 | L2:M3 | first덧셈뺄셈2_답 | Module43.first덧셈뺄셈2_답(2-29) | 정상 |
| 1덧셈뺄셈③ | 폼 버튼 | _x0000_s248834 | M2:O3 | first덧셈뺄셈2_문제 | Module43.first덧셈뺄셈2_문제(30-51) | 정상 |
| 1덧셈뺄셈③ | 폼 버튼 | _x0000_s248835 | P1:R3 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 1덧셈뺄셈③ | 도형/그림 | 7 | L3:L3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 1덧셈뺄셈④ | 폼 버튼 | _x0000_s243713 | L2:M3 | first덧셈b_답 | 없음 | 끊김 |
| 1덧셈뺄셈④ | 폼 버튼 | _x0000_s243714 | M2:O3 | first덧셈뺄셈3_문제 | Module1.first덧셈뺄셈3_문제(19-35) | 정상 |
| 1덧셈뺄셈④ | 폼 버튼 | _x0000_s243715 | P2:R3 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 1덧셈뺄셈④ | 폼 버튼 | _x0000_s243717 | L2:M3 | first덧셈뺄셈4_답 | Module1.first덧셈뺄셈4_답(2-18) | 정상 |
| 1덧셈뺄셈④ | 도형/그림 | 2 | L3:M4 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 1수읽기 | 폼 버튼 | _x0000_s624641 | M2:O3 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 1수읽기 | 폼 버튼 | _x0000_s624642 | J2:K3 | first읽기_답 | Module60.first읽기_답(2-17) | 정상 |
| 1수읽기 | 폼 버튼 | _x0000_s624643 | K2:M3 | first읽기_문제 | Module60.first읽기_문제(18-33) | 정상 |
| 1수읽기 | 도형/그림 | 3 | L3:L3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 1뛰어세기 | 폼 버튼 | _x0000_s275458 | L1:N3 | first뛰어세기_문제 | Module44.first뛰어세기_문제(3-19) | 정상 |
| 1뛰어세기 | 폼 버튼 | _x0000_s275459 | N1:P3 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 1뛰어세기 | 폼 버튼 | _x0000_s275461 | K2:L3 | first뛰어세기_답 | Module45.first뛰어세기_답(2-21) | 정상 |
| 1뛰어세기 | 도형/그림 | 2 | I2:J3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 2덧셈뺄셈① | 폼 버튼 | _x0000_s1001473 | H3:I4 | third덧셈뺄셈_답 | Module50.third덧셈뺄셈_답(2-21) | 정상 |
| 2덧셈뺄셈① | 폼 버튼 | _x0000_s1001474 | H4:I5 | third덧셈뺄셈_문제 | Module50.third덧셈뺄셈_문제(22-40) | 정상 |
| 2덧셈뺄셈① | 폼 버튼 | _x0000_s1001475 | H6:I7 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 2덧셈뺄셈① | 폼 버튼 | _x0000_s1001476 | A1:B2 | 문제지선택 | Module35.문제지선택(3-5) | 정상 |
| 2덧셈뺄셈① | 도형/그림 | 2 | H1:I3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 2덧셈뺄셈② | 폼 버튼 | _x0000_s1002497 | O5:R7 | third빈칸_답 | Module13.third빈칸_답(19-35) | 정상 |
| 2덧셈뺄셈② | 폼 버튼 | _x0000_s1002498 | O8:R9 | third빈칸_문제 | Module13.third빈칸_문제(2-18) | 정상 |
| 2덧셈뺄셈② | 폼 버튼 | _x0000_s1002499 | O9:R9 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 2덧셈뺄셈② | 도형/그림 | 2 | O1:Q2 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 2덧셈뺄셈③ | 폼 버튼 | _x0000_s372737 | N2:O3 | first덧셈b_답 | 없음 | 끊김 |
| 2덧셈뺄셈③ | 폼 버튼 | _x0000_s372738 | O1:Q3 | second덧셈뺄셈_문제 | Module22.second덧셈뺄셈_문제(19-35) | 정상 |
| 2덧셈뺄셈③ | 폼 버튼 | _x0000_s372739 | R1:T3 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 2덧셈뺄셈③ | 폼 버튼 | _x0000_s372741 | M1:O3 | second덧셈뺄셈_답 | Module22.second덧셈뺄셈_답(2-18) | 정상 |
| 2덧셈뺄셈③ | 폼 버튼 | _x0000_s372742 | A1:C3 | 문제지선택 | Module35.문제지선택(3-5) | 정상 |
| 2덧셈뺄셈③ | 도형/그림 | 2 | M3:N4 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 2묶어세기 | 폼 버튼 | _x0000_s404482 | V4:Y5 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 2묶어세기 | 폼 버튼 | _x0000_s404483 | V1:Y2 | second개수세기_답 | Module49.second개수세기_답(2-17) | 정상 |
| 2묶어세기 | 폼 버튼 | _x0000_s404484 | V3:Y4 | second개수세기_문제 | Module49.second개수세기_문제(18-33) | 정상 |
| 2묶어세기 | 도형/그림 | 2 | T1:T1 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 2길이재기 | 폼 버튼 | _x0000_s402434 | M1:O2 | second어림_문제 | Module14.second어림_문제(17-31) | 정상 |
| 2길이재기 | 폼 버튼 | _x0000_s402435 | O1:Q2 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 2길이재기 | 폼 버튼 | _x0000_s402437 | K1:M2 | second어림_답 | Module14.second어림_답(2-16) | 정상 |
| 2길이재기 | 도형/그림 | 2 | O2:P4 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 2구구단① | 폼 버튼 | _x0000_s398337 | L2:M3 | first덧셈b_답 | 없음 | 끊김 |
| 2구구단① | 폼 버튼 | _x0000_s398338 | M2:O3 | second구구단_문제 | Module46.second구구단_문제(23-44) | 정상 |
| 2구구단① | 폼 버튼 | _x0000_s398339 | P1:R3 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 2구구단① | 폼 버튼 | _x0000_s398341 | L2:M3 | second구구단_답 | Module46.second구구단_답(2-22) | 정상 |
| 2구구단① | 도형/그림 | 2 | L3:M4 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 2구구단② | 폼 버튼 | _x0000_s399361 | L2:M3 | first덧셈b_답 | 없음 | 끊김 |
| 2구구단② | 폼 버튼 | _x0000_s399362 | M2:O3 | second구구단_문제 | Module46.second구구단_문제(23-44) | 정상 |
| 2구구단② | 폼 버튼 | _x0000_s399363 | P1:R3 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 2구구단② | 폼 버튼 | _x0000_s399365 | L2:M3 | second구구단_답 | Module46.second구구단_답(2-22) | 정상 |
| 2구구단② | 도형/그림 | 2 | L3:M4 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 2구구단③ | 폼 버튼 | _x0000_s400385 | L2:M3 | first덧셈b_답 | 없음 | 끊김 |
| 2구구단③ | 폼 버튼 | _x0000_s400386 | M2:O3 | second구구단_문제 | Module46.second구구단_문제(23-44) | 정상 |
| 2구구단③ | 폼 버튼 | _x0000_s400387 | P1:R3 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 2구구단③ | 폼 버튼 | _x0000_s400389 | L2:M3 | second구구단_답 | Module46.second구구단_답(2-22) | 정상 |
| 2구구단③ | 도형/그림 | 2 | L3:M4 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 2구구단④ | 폼 버튼 | _x0000_s401409 | L2:M3 | first덧셈b_답 | 없음 | 끊김 |
| 2구구단④ | 폼 버튼 | _x0000_s401410 | M2:O3 | second구구단_문제 | Module46.second구구단_문제(23-44) | 정상 |
| 2구구단④ | 폼 버튼 | _x0000_s401411 | P2:R3 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 2구구단④ | 폼 버튼 | _x0000_s401413 | L2:M3 | second구구단_답 | Module46.second구구단_답(2-22) | 정상 |
| 2구구단④ | 도형/그림 | 2 | L3:M4 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 2구구단⑤ | 폼 버튼 | _x0000_s56326 | J2:K2 | 구구단_답 | Module45.구구단_답(22-54) | 정상 |
| 2구구단⑤ | 폼 버튼 | _x0000_s56327 | K2:M2 | 구구단_문제 | Module45.구구단_문제(55-77) | 정상 |
| 2구구단⑤ | 폼 버튼 | _x0000_s56328 | M2:O2 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 2구구단⑤ | 도형/그림 | 5 | M3:M4 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 2시계① | 폼 버튼 | _x0000_s665621 | G1:H3 | second시계A_문제 | Module2.second시계A_문제(18-32) | 정상 |
| 2시계① | 폼 버튼 | _x0000_s665623 | E1:G3 | second시계A_답 | Module2.second시계A_답(2-17) | 정상 |
| 2시계① | 도형/그림 | 13 | F3:G5 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 2시계② | 폼 버튼 | _x0000_s678913 | G1:H3 | second시계A_문제 | Module2.second시계A_문제(18-32) | 정상 |
| 2시계② | 폼 버튼 | _x0000_s678915 | E1:G3 | second시계A_답 | Module2.second시계A_답(2-17) | 정상 |
| 2시계② | 도형/그림 | 12 | F3:G5 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3덧셈뺄셈 | 폼 버튼 | _x0000_s435201 | H4:J5 | third덧셈뺄셈_답 | Module50.third덧셈뺄셈_답(2-21) | 정상 |
| 3덧셈뺄셈 | 폼 버튼 | _x0000_s435202 | H5:J6 | third덧셈뺄셈_문제 | Module50.third덧셈뺄셈_문제(22-40) | 정상 |
| 3덧셈뺄셈 | 폼 버튼 | _x0000_s435203 | H7:J7 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3덧셈뺄셈 | 폼 버튼 | _x0000_s435204 | A1:B2 | 문제지선택 | Module35.문제지선택(3-5) | 정상 |
| 3덧셈뺄셈 | 도형/그림 | 2 | H1:I3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3덧셈뺄셈빈칸 | 폼 버튼 | _x0000_s870401 | Q2:S3 | third빈칸_답 | Module13.third빈칸_답(19-35) | 정상 |
| 3덧셈뺄셈빈칸 | 폼 버튼 | _x0000_s870402 | Q3:S5 | third빈칸_문제 | Module13.third빈칸_문제(2-18) | 정상 |
| 3덧셈뺄셈빈칸 | 폼 버튼 | _x0000_s870403 | Q5:S8 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3덧셈뺄셈빈칸 | 도형/그림 | 2 | O1:Q2 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3보수뺄셈100 | 폼 버튼 | _x0000_s786433 | L1:N2 | third덧셈뺄셈b_답 | Module7.third덧셈뺄셈b_답(18-33) | 정상 |
| 3보수뺄셈100 | 폼 버튼 | _x0000_s786434 | L2:N3 | third덧셈뺄셈b_문제 | Module7.third덧셈뺄셈b_문제(2-17) | 정상 |
| 3보수뺄셈100 | 폼 버튼 | _x0000_s786435 | L3:N4 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3보수뺄셈100 | 도형/그림 | 2 | H1:I3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3보수뺄셈1000 | 폼 버튼 | _x0000_s787457 | L1:N2 | third덧셈뺄셈b_답 | Module7.third덧셈뺄셈b_답(18-33) | 정상 |
| 3보수뺄셈1000 | 폼 버튼 | _x0000_s787458 | L2:N3 | third덧셈뺄셈b_문제 | Module7.third덧셈뺄셈b_문제(2-17) | 정상 |
| 3보수뺄셈1000 | 폼 버튼 | _x0000_s787459 | L3:N4 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3보수뺄셈1000 | 도형/그림 | 2 | H1:I3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3덧셈뺄셈② | 폼 버튼 | _x0000_s785409 | L1:N2 | third덧셈뺄셈b_답 | Module7.third덧셈뺄셈b_답(18-33) | 정상 |
| 3덧셈뺄셈② | 폼 버튼 | _x0000_s785410 | L2:N3 | third덧셈뺄셈b_문제 | Module7.third덧셈뺄셈b_문제(2-17) | 정상 |
| 3덧셈뺄셈② | 폼 버튼 | _x0000_s785411 | L3:N4 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3덧셈뺄셈② | 도형/그림 | 2 | H1:I3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3나눗셈① | 폼 버튼 | _x0000_s27649 | J1:K2 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3나눗셈① | 폼 버튼 | _x0000_s27652 | I1:J2 | 포함등분_문제 | Module17.포함등분_문제(35-72) | 정상 |
| 3나눗셈① | 폼 버튼 | _x0000_s27653 | H1:I2 | 포함등분_답 | Module17.포함등분_답(2-34) | 정상 |
| 3나눗셈① | 도형/그림 | 5 | I2:I3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3곱셈① | 폼 버튼 | _x0000_s460801 | I2:K3 | third곱셈1_답 | Module51.third곱셈1_답(18-32) | 정상 |
| 3곱셈① | 폼 버튼 | _x0000_s460802 | I4:K5 | third곱셈1_문제 | Module51.third곱셈1_문제(2-17) | 정상 |
| 3곱셈① | 폼 버튼 | _x0000_s460803 | I5:K6 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3곱셈① | 도형/그림 | 2 | H1:I2 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3곱셈② | 폼 버튼 | _x0000_s836609 | L1:N2 | third덧셈뺄셈b_답 | Module7.third덧셈뺄셈b_답(18-33) | 정상 |
| 3곱셈② | 폼 버튼 | _x0000_s836610 | L2:N3 | third덧셈뺄셈b_문제 | Module7.third덧셈뺄셈b_문제(2-17) | 정상 |
| 3곱셈② | 폼 버튼 | _x0000_s836611 | L3:N4 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3곱셈② | 도형/그림 | 2 | H1:I3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3길이 | 폼 버튼 | _x0000_s12291 | K1:L1 | 길이_문제 | Module16.길이_문제(5-30) | 정상 |
| 3길이 | 폼 버튼 | _x0000_s12292 | L1:O1 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3길이 | 폼 버튼 | _x0000_s12293 | J1:K1 | 길이_답 | Module9.길이_답(2-26) | 정상 |
| 3길이 | 도형/그림 | 5 | J2:K3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3시간① | 폼 버튼 | _x0000_s11265 | M1:N2 | third시간1_답 | Module5.third시간1_답(2-17) | 정상 |
| 3시간① | 폼 버튼 | _x0000_s11266 | M2:N3 | third시간1_문제 | Module5.third시간1_문제(18-33) | 정상 |
| 3시간① | 폼 버튼 | _x0000_s11267 | M3:N4 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3시간① | 도형/그림 | 5 | N5:N6 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3시간② | 폼 버튼 | _x0000_s741377 | L1:M2 | third시간_답 | Module55.third시간_답(2-16) | 정상 |
| 3시간② | 폼 버튼 | _x0000_s741378 | L2:M5 | third시간_문제 | Module55.third시간_문제(17-31) | 정상 |
| 3시간② | 폼 버튼 | _x0000_s741379 | L6:M7 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3시간② | 도형/그림 | 2 | M8:M9 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3곱셈③ | 폼 버튼 | _x0000_s1025 | V4:W5 | third곱셈_답 | Module23.third곱셈_답(2-16) | 정상 |
| 3곱셈③ | 폼 버튼 | _x0000_s1026 | V6:W6 | third곱셈_문제 | Module23.third곱셈_문제(17-31) | 정상 |
| 3곱셈③ | 폼 버튼 | _x0000_s1027 | V7:W8 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3곱셈③ | 도형/그림 | 6 | V1:W2 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 19단 | 폼 버튼 | _x0000_s161793 | E1:F2 | 십구단_답 | Module18.십구단_답(17-32) | 정상 |
| 19단 | 폼 버튼 | _x0000_s161794 | F1:G2 | 십구단_문제 | Module18.십구단_문제(2-16) | 정상 |
| 19단 | 폼 버튼 | _x0000_s161795 | G1:H2 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 19단 | 도형/그림 | 2 | F2:G2 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 제곱수 | 폼 버튼 | _x0000_s162817 | I1:J2 | 제곱수_문제 | Module11.제곱수_문제(2-16) | 정상 |
| 제곱수 | 폼 버튼 | _x0000_s162818 | G1:I2 | 제곱수_답 | Module11.제곱수_답(17-31) | 정상 |
| 제곱수 | 폼 버튼 | _x0000_s162819 | J1:K2 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 제곱수 | 도형/그림 | 2 | K1:M3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3나눗셈② | 폼 버튼 | _x0000_s910337 | V1:Y2 | third나눗셈B_답 | Module8.third나눗셈B_답(2-17) | 정상 |
| 3나눗셈② | 폼 버튼 | _x0000_s910338 | V2:Y3 | third나눗셈B_문제 | Module8.third나눗셈B_문제(18-33) | 정상 |
| 3나눗셈② | 폼 버튼 | _x0000_s910339 | V3:Y4 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3나눗셈② | 도형/그림 | 2 | T1:V3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3나눗셈③ | 폼 버튼 | _x0000_s1103873 | J1:L2 | third분수C_문제 | Module26.third분수C_문제(2-16) | 정상 |
| 3나눗셈③ | 폼 버튼 | _x0000_s1103874 | I1:J2 | third나눗셈C_답 | Module26.third나눗셈C_답(17-31) | 정상 |
| 3나눗셈③ | 폼 버튼 | _x0000_s1103875 | L1:N2 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3나눗셈③ | 도형/그림 | 2 | N1:N3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3분수① | 폼 버튼 | _x0000_s100353 | P1:Q2 | third분수_답 | Module24.third분수_답(2-48) | 정상 |
| 3분수① | 폼 버튼 | _x0000_s100354 | P3:Q4 | third분수_문제 | Module24.third분수_문제(49-102) | 정상 |
| 3분수① | 폼 버튼 | _x0000_s100355 | P4:Q5 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3분수① | 도형/그림 | 5 | O1:O2 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3분수② | 폼 버튼 | _x0000_s486401 | N1:O1 | third분수B_답 | Module53.third분수B_답(2-39) | 정상 |
| 3분수② | 폼 버튼 | _x0000_s486402 | N2:O2 | third분수B_문제 | Module53.third분수B_문제(40-72) | 정상 |
| 3분수② | 폼 버튼 | _x0000_s486403 | N2:O4 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3분수② | 도형/그림 | 7 | L1:M2 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3무게,들이 | 폼 버튼 | _x0000_s46081 | K1:M2 | 무게들이_문제 | Module16.무게들이_문제(31-47) | 정상 |
| 3무게,들이 | 폼 버튼 | _x0000_s46082 | M1:O2 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3무게,들이 | 폼 버튼 | _x0000_s46083 | J1:K2 | 무게들이_답 | Module9.무게들이_답(27-43) | 정상 |
| 3무게,들이 | 도형/그림 | 5 | K2:L3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 3분수③ | 폼 버튼 | _x0000_s1067009 | J2:M3 | third단위_답 | Module15.third단위_답(2-16) | 정상 |
| 3분수③ | 폼 버튼 | _x0000_s1067010 | J3:M4 | third단위_문제 | Module15.third단위_문제(17-31) | 정상 |
| 3분수③ | 폼 버튼 | _x0000_s1067011 | J4:M5 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 3분수③ | 도형/그림 | 2 | K6:N7 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 4숫자읽기 | 폼 버튼 | _x0000_s164867 | L2:N3 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 4숫자읽기 | 폼 버튼 | _x0000_s164873 | G2:I3 | fourth큰수_답 | Module33.fourth큰수_답(21-39) | 정상 |
| 4숫자읽기 | 폼 버튼 | _x0000_s164874 | I2:L3 | fourth큰수_문제 | Module33.fourth큰수_문제(2-20) | 정상 |
| 4숫자읽기 | 폼 버튼 | _x0000_s164875 | A1:B2 | 문제지선택 | Module35.문제지선택(3-5) | 정상 |
| 4숫자읽기 | 도형/그림 | 2 | I4:K5 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 4곱셈 | 폼 버튼 | _x0000_s74753 | J2:K3 | fourth곱셈_답 | Module55.fourth곱셈_답(32-46) | 정상 |
| 4곱셈 | 폼 버튼 | _x0000_s74754 | J3:K4 | fourth곱셈_문제 | Module55.fourth곱셈_문제(47-61) | 정상 |
| 4곱셈 | 폼 버튼 | _x0000_s74755 | J5:K6 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 4곱셈 | 도형/그림 | 5 | I1:J3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 4큰수곱셈 | 폼 버튼 | _x0000_s937985 | J4:K5 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 4큰수곱셈 | 폼 버튼 | _x0000_s937986 | J2:K2 | fourth큰수곱셈_답 | Module13.fourth큰수곱셈_답(36-50) | 정상 |
| 4큰수곱셈 | 폼 버튼 | _x0000_s937987 | J3:K4 | fourth큰수곱셈_문제 | Module13.fourth큰수곱셈_문제(51-65) | 정상 |
| 4큰수곱셈 | 도형/그림 | 2 | I1:J2 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 4나눗셈 | 폼 버튼 | _x0000_s5124 | J4:K5 | fourth나눗셈_문제 | Module59.fourth나눗셈_문제(39-55) | 정상 |
| 4나눗셈 | 폼 버튼 | _x0000_s5125 | J2:K4 | fourth나눗셈_답 | Module59.fourth나눗셈_답(24-38) | 정상 |
| 4나눗셈 | 폼 버튼 | _x0000_s5126 | J5:K6 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 4나눗셈 | 도형/그림 | 29 | I2:J5 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 4분수 | 폼 버튼 | _x0000_s2049 | R12:T14 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 4분수 | 폼 버튼 | _x0000_s2050 | R6:T8 | fourth분수_답 | Module4.fourth분수_답(16-111) | 정상 |
| 4분수 | 폼 버튼 | _x0000_s2051 | R9:T11 | fourth분수_문제 | Module4.fourth분수_문제(112-137) | 정상 |
| 4분수 | 도형/그림 | 5 | S14:T17 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 4소수 | 폼 버튼 | _x0000_s22529 | N1:N2 | fourth소수_답 | Module59.fourth소수_답(56-70) | 정상 |
| 4소수 | 폼 버튼 | _x0000_s22530 | N2:N3 | fourth소수_문제 | Module59.fourth소수_문제(71-85) | 정상 |
| 4소수 | 폼 버튼 | _x0000_s22531 | N4:N5 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 4소수 | 도형/그림 | 5 | N5:O6 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 단위변환 | 폼 버튼 | _x0000_s204801 | J2:L3 | fourth단위_답 | Module39.fourth단위_답(25-44) | 정상 |
| 단위변환 | 폼 버튼 | _x0000_s204802 | J3:L4 | fourth단위_문제 | Module39.fourth단위_문제(2-24) | 정상 |
| 단위변환 | 폼 버튼 | _x0000_s204803 | J4:L5 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 단위변환 | 도형/그림 | 2 | I2:J3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 5혼합계산 | 폼 버튼 | _x0000_s513025 | H3:I4 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 5혼합계산 | 폼 버튼 | _x0000_s513026 | H2:I3 | fourth혼합계산_답 | Module55.fourth혼합계산_답(62-76) | 정상 |
| 5혼합계산 | 폼 버튼 | _x0000_s513027 | H3:I3 | fourth혼합계산_문제 | Module55.fourth혼합계산_문제(77-91) | 정상 |
| 5혼합계산 | 폼 버튼 | _x0000_s513028 | A1:B1 | 문제지선택 | Module35.문제지선택(3-5) | 정상 |
| 5혼합계산 | 도형/그림 | 2 | G2:G2 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 자연수분해 | 폼 버튼 | _x0000_s538625 | O1:P2 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 자연수분해 | 폼 버튼 | _x0000_s538626 | K1:L2 | fifth소인수분해_답 | Module57.fifth소인수분해_답(2-20) | 정상 |
| 자연수분해 | 폼 버튼 | _x0000_s538627 | M1:O2 | fifth소인수분해_문제 | Module57.fifth소인수분해_문제(21-43) | 정상 |
| 자연수분해 | 도형/그림 | 2 | P3:Q4 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 프라임넘버 | 폼 버튼 | _x0000_s712705 | K2:M4 | fifth소수찾기_답 | Module3.fifth소수찾기_답(2-56) | 정상 |
| 프라임넘버 | 폼 버튼 | _x0000_s712706 | K4:M5 | fifth소수찾기_문제 | Module3.fifth소수찾기_문제(58-86) | 정상 |
| 프라임넘버 | 도형/그림 | 2 | J1:K3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 5약수,배수 | 폼 버튼 | _x0000_s371713 | P1:R1 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 5약수,배수 | 폼 버튼 | _x0000_s371715 | L1:M1 | first덧셈뺄셈2_답 | Module43.first덧셈뺄셈2_답(2-29) | 정상 |
| 5약수,배수 | 폼 버튼 | _x0000_s371716 | M1:O1 | first덧셈뺄셈2_문제 | Module43.first덧셈뺄셈2_문제(30-51) | 정상 |
| 5약수,배수 | 도형/그림 | 3 | L2:L2 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 5분수① | 폼 버튼 | _x0000_s19460 | W5:Y9 | fifth분수A_문제 | Module21.fifth분수A_문제(198-227) | 정상 |
| 5분수① | 폼 버튼 | _x0000_s19461 | W2:Y4 | fifth분수A_답 | Module21.fifth분수A_답(48-197) | 정상 |
| 5분수① | 폼 버튼 | _x0000_s19462 | W10:Y11 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 5분수① | 도형/그림 | 5 | U2:W5 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 5분수② | 폼 버튼 | _x0000_s4097 | U3:X6 | fifth분수B_답 | Module31.fifth분수B_답(2-205) | 정상 |
| 5분수② | 폼 버튼 | _x0000_s4098 | AA3:AD6 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 5분수② | 폼 버튼 | _x0000_s4103 | X3:AA6 | fifth분수B_문제 | Module31.fifth분수B_문제(206-236) | 정상 |
| 5분수② | 도형/그림 | 5 | V7:X12 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 5분수③ | 폼 버튼 | _x0000_s1131521 | U5:W9 | fifth분수대소_문제 | Module25.fifth분수대소_문제(3-18) | 정상 |
| 5분수③ | 폼 버튼 | _x0000_s1131522 | U3:W4 | fifth분수대소_답 | Module25.fifth분수대소_답(20-36) | 정상 |
| 5분수③ | 폼 버튼 | _x0000_s1131523 | U10:W13 | fifth분수대소데이터 | Module10.fifth분수대소데이터(2-135) | 정상 |
| 5분수③ | 도형/그림 | 2 | S3:T4 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 5소수 | 폼 버튼 | _x0000_s680961 | O5:S6 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 5소수 | 폼 버튼 | _x0000_s680962 | O4:S5 | fifth소수_문제 | Module19.fifth소수_문제(2-17) | 정상 |
| 5소수 | 폼 버튼 | _x0000_s680963 | O3:S4 | fifth소수_답 | Module19.fifth소수_답(18-35) | 정상 |
| 5소수 | 도형/그림 | 2 | Q1:S3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 6분수 | 폼 버튼 | _x0000_s679937 | W5:Y9 | fifth분수A_문제 | Module21.fifth분수A_문제(198-227) | 정상 |
| 6분수 | 폼 버튼 | _x0000_s679938 | W2:Y4 | fifth분수A_답 | Module21.fifth분수A_답(48-197) | 정상 |
| 6분수 | 폼 버튼 | _x0000_s679939 | W10:Y13 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 6분수 | 폼 버튼 | _x0000_s679940 | B2:D3 | 문제지선택 | Module35.문제지선택(3-5) | 정상 |
| 6분수 | 도형/그림 | 2 | U2:V5 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 6소수① | 폼 버튼 | _x0000_s1213441 | J4:K5 | sixth소수A_문제 | Module27.sixth소수A_문제(18-34) | 정상 |
| 6소수① | 폼 버튼 | _x0000_s1213442 | J2:K4 | sixth소수A_답 | Module27.sixth소수A_답(2-17) | 정상 |
| 6소수① | 폼 버튼 | _x0000_s1213443 | J5:K6 | sixth소수A_새로고침 | Module1.sixth소수A_새로고침(38-130) | 정상 |
| 6소수① | 도형/그림 | 15 | I2:J5 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 6소수② | 폼 버튼 | _x0000_s72707 | U5:W6 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 6소수② | 폼 버튼 | _x0000_s72708 | U4:W4 | fifth소수_문제 | Module19.fifth소수_문제(2-17) | 정상 |
| 6소수② | 폼 버튼 | _x0000_s72709 | U2:W3 | fifth소수_답 | Module19.fifth소수_답(18-35) | 정상 |
| 6소수② | 도형/그림 | 5 | W1:W2 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 6소수③ | 폼 버튼 | _x0000_s96257 | W2:Y2 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 6소수③ | 폼 버튼 | _x0000_s96258 | S2:W3 | fifth소수_문제 | Module19.fifth소수_문제(2-17) | 정상 |
| 6소수③ | 폼 버튼 | _x0000_s96259 | Q2:S3 | fifth소수_답 | Module19.fifth소수_답(18-35) | 정상 |
| 6소수③ | 도형/그림 | 5 | W3:X4 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 6혼합계산 | 폼 버튼 | _x0000_s102401 | T2:V3 | sixth혼합계산_답 | Module31.sixth혼합계산_답(276-370) | 정상 |
| 6혼합계산 | 폼 버튼 | _x0000_s102404 | V2:Y3 | sixth혼합계산_문제 | Module31.sixth혼합계산_문제(237-275) | 정상 |
| 6혼합계산 | 폼 버튼 | _x0000_s102405 | Y2:AB3 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 6혼합계산 | 도형/그림 | 2 | U4:W6 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 6비례식 | 폼 버튼 | _x0000_s514049 | J1:K1 | sixth비례식_답 | Module12.sixth비례식_답(2-16) | 정상 |
| 6비례식 | 폼 버튼 | _x0000_s514050 | K1:L1 | sixth비례식_문제 | Module12.sixth비례식_문제(17-31) | 정상 |
| 6비례식 | 폼 버튼 | _x0000_s514051 | L1:M1 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 6비례식 | 도형/그림 | 2 | L2:L3 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 6원 | 폼 버튼 | _x0000_s91139 | G6:H7 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 6원 | 폼 버튼 | _x0000_s91140 | G3:H4 | sixth원평면_답 | Module21.sixth원평면_답(2-24) | 정상 |
| 6원 | 폼 버튼 | _x0000_s91141 | G4:H5 | sixth원평면_문제 | Module21.sixth원평면_문제(25-47) | 정상 |
| 6원 | 도형/그림 | 9 | H3:H4 | 인쇄 | Module20.인쇄(2-6) | 정상 |
| 6원기둥 | 폼 버튼 | _x0000_s69634 | H4:H5 | sixth원입체_답 | Module18.sixth원입체_답(56-92) | 정상 |
| 6원기둥 | 폼 버튼 | _x0000_s69635 | H5:H6 | sixth원입체_문제 | Module18.sixth원입체_문제(33-55) | 정상 |
| 6원기둥 | 폼 버튼 | _x0000_s69636 | H6:H7 | 문제바꾸기 | Module4.문제바꾸기(6-14) | 정상 |
| 6원기둥 | 도형/그림 | 9 | G2:G4 | 인쇄 | Module20.인쇄(2-6) | 정상 |

## 9. 확인된 결함 또는 끊어진 연결

| 종류 | 위치 | 근거 | 대상 | 판정 |
| --- | --- | --- | --- | --- |
| 버튼 매크로 없음 | 연습일지 | 폼 버튼 D2:F3 | 현재시트저장 | 프로젝트 내 동명 프로시저가 없음 |
| 버튼 매크로 없음 | 연습일지 | 폼 버튼 C2:D3 | 입력창띄워 | 프로젝트 내 동명 프로시저가 없음 |
| 버튼 매크로 없음 | 연습일지 | 폼 버튼 K1:K2 | 일지제목바꾸기 | 프로젝트 내 동명 프로시저가 없음 |
| 버튼 매크로 없음 | 연습일지 | 폼 버튼 F2:F3 | 일지초기화 | 프로젝트 내 동명 프로시저가 없음 |
| 버튼 매크로 없음 | 연습일지 | 폼 버튼 A45:C46 | 메모폼 | 프로젝트 내 동명 프로시저가 없음 |
| 버튼 매크로 없음 | 1덧셈뺄셈④ | 폼 버튼 L2:M3 | first덧셈b_답 | 프로젝트 내 동명 프로시저가 없음 |
| 버튼 매크로 없음 | 2덧셈뺄셈③ | 폼 버튼 N2:O3 | first덧셈b_답 | 프로젝트 내 동명 프로시저가 없음 |
| 버튼 매크로 없음 | 2구구단① | 폼 버튼 L2:M3 | first덧셈b_답 | 프로젝트 내 동명 프로시저가 없음 |
| 버튼 매크로 없음 | 2구구단② | 폼 버튼 L2:M3 | first덧셈b_답 | 프로젝트 내 동명 프로시저가 없음 |
| 버튼 매크로 없음 | 2구구단③ | 폼 버튼 L2:M3 | first덧셈b_답 | 프로젝트 내 동명 프로시저가 없음 |
| 버튼 매크로 없음 | 2구구단④ | 폼 버튼 L2:M3 | first덧셈b_답 | 프로젝트 내 동명 프로시저가 없음 |
| UserForm 대상 시트 없음 | 문제선택 | C3시_Click 63-66 | 3시간 | 실제 시트는 3시간①/②이며 어느 쪽이 의도인지 미확정 |
| UserForm 대상 시트 없음 | 문제선택 | C6소_Click 108-111 | 6소수 | 실제 시트는 6소수①/②/③이며 의도 미확정 |
| UserForm 대상 시트 없음 | 문제선택 | CommandButton19_Click 183-186 | 5인수분해 | 동명 시트 없음; 자연수분해와의 관계는 추정 금지 |
| UserForm 대상 시트 없음 | 문제선택 | CommandButton6_Click 228-231 | 1수세기② | 동명 시트 없음 |
| UserForm 없음 | 연습일지/Sheet27 | 입력_Click 11-13 | 결과입력.Show | VBA 프로젝트에는 문제선택 UserForm만 존재 |
| 정의 이름 오류 | 통합문서 | _xleta.T | #NAME? | 숨김 XLM 이름의 정의식이 오류 |
| 캐시된 수식 오류 | 연습일지 | G5:G43 | REPT("―",E행-2) | E5:E43이 비어 음수 반복수가 되어 #VALUE! 캐시 |

## 10. 외부 환경 의존성

| 환경 | 확인 결과 | 근거 |
| --- | --- | --- |
| 외부 통합문서/연결 | 없음 | externalLinks, connections, queryTables 파트 0; 외부 파일 참조 수식 없음 |
| 운영 URL/하이퍼링크 | 없음 | 시트 hyperlink 0; VBA URL 문자열 0 |
| SharePoint 메타데이터 | 잔존하지만 실행 의존성은 확인되지 않음 | customXml에 문서 콘텐츠 형식·DocumentLibraryForm·스키마 namespace가 있으나 외부 relationship은 없음 |
| 파일·프로그램 실행 | 없음 | Shell/CreateObject/GetObject/Workbooks.Open/Declare/FileCopy/Kill 호출 없음 |
| Office/VBA | 필수 | Excel8.0, EXCEL.EXE, MSO.DLL, VBE7.DLL, FM20.DLL, stdole2.tlb 참조 |
| UserForm | Microsoft Forms 2.0 | 문제선택/CompObj에 Microsoft Forms 2.0 Form |
| 프린터 | Microsoft Print to PDF로 저장됨 | 69개 printerSettings 바이너리 모두 동일 장치명 포함 |
| 인쇄 실행 | 현재 Excel 환경의 인쇄 대화상자 사용 | Module20.인쇄의 xlDialogPrint |
| 통합문서/시트 보호 | 구조 보호 및 대부분 시트 보호 | workbook lockStructure=1; 64개 보호 시트; Module8은 하드코딩된 비밀번호로 3나눗셈②를 해제/재보호 |
| 기관/연도 문자열 | 폼 Caption에 고정 | 문제선택 VBFrame: 2026-계상초등학교 |

## 11. 웹에서 동일 구현 가능한 기능

- 사칙연산, 분수, 소수, 약수·배수, 단위 변환 등 문제 생성 수식과 VBA 난수 알고리즘
- 새 문제, 문제 보기, 정답 보기, 문제 선택, 인쇄/PDF
- 숨김 원본 시트의 데이터 선택·섞기·랭킹 로직
- 문제별 정답 범위 표시와 단계별 풀이 영역
- 보호 시트가 담당하던 읽기 전용/편집 가능 상태

권장 구현 단위는 `활동 정의(JSON) + 순수 문제 생성 함수 + 정답 상태 + 렌더러`다. 난수는 seed를 저장해 문제를 재현할 수 있게 하고, 각 문제 생성 함수에 Excel 수식과 같은 제약을 테스트로 고정하는 편이 안전하다.

## 12. 웹에서 재설계가 필요한 기능

- 전역 `Calculate`: 현재 문제만 갱신하는 UX로 바꿀지 전체 문제를 동시에 갱신할지 결정
- 글자색으로 정답 숨김: DOM 상태와 접근성 속성으로 전환
- `Selection`/`ActiveSheet` 의존 VBA: 명시적인 활동 ID와 출력 영역으로 전환
- UserForm: 라우팅 메뉴로 전환하고 존재하지 않는 4개 대상의 의도 확정
- 시계·도형·WMF/EMF·Ink: SVG/Canvas로 재작성하고 실제 시각 검수
- `3분수②!H4:I26, K4:K26`의 잠금 해제 작업 영역: 웹 필기 캔버스 또는 답안 입력으로 재정의
- Microsoft Print to PDF: 브라우저 인쇄/PDF용 CSS 페이지 규격으로 재설계
- 보호 비밀번호: 웹 보안 기능으로 취급하지 말고 권한/상태 제어로 대체
- 7191개 수식을 브라우저에서 그대로 평가하기보다 문제 유형별 순수 함수로 이관하고 회귀 테스트 작성

## 13. 실행해 봐야만 확정 가능한 항목

- 겹쳐 있는 폼 버튼과 그림 중 실제로 위에 놓여 클릭되는 객체; 특히 `first덧셈b_답`이 배정된 6개 오래된 컨트롤의 사용자 영향
- VML Caption이 비어 있는 버튼의 실제 표시문구와 이미지 레이어 조합
- 현재 Excel 버전·매크로 보안 설정에서 VBA 프로젝트가 경고 없이 로드·실행되는지
- 문제선택 UserForm의 실제 탭 순서, 크기, 잘림, 고해상도 표시
- 69개 인쇄 레이아웃이 실제 용지에서 잘리지 않는지와 기본 프린터 변경 시 결과
- RAND/RANDBETWEEN을 다시 계산했을 때 각 문제 제약이 항상 충족되는지; 특히 Module1의 제한 없는 Do While과 Module10의 5000회 탈출 경로
- 보호 시트에서 문제/답 매크로의 서식 변경이 모든 Excel 버전에서 허용되는지
- 시계, WMF/EMF, Ink 도형이 브라우저 변환 시 원본과 시각적으로 일치하는지

이 목록은 추측 항목이 아니라 실행 또는 시각 상호작용 검사가 필요한 경계다. 원본 매크로는 이번 분석에서 실행하지 않았다.
