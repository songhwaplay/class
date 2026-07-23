Attribute VB_Name = "Module10"
Sub fifth분수대소데이터()
    Dim ws As Worksheet
    Dim i As Integer, r As Integer, strategy As Integer, attempt As Long
    Dim n1 As Long, d1 As Long, n2 As Long, d2 As Long
    Dim strategies(1 To 10) As Integer
    Dim temp As Long, randIdx As Integer, commonDiff As Integer, result As String
    Dim strategyName As String, case8Count As Integer
    
    Application.ScreenUpdating = False
    Application.Calculation = xlCalculationManual

    On Error Resume Next
    Set ws = ThisWorkbook.Sheets("분수대소데이터")
    If ws Is Nothing Then
        Set ws = ThisWorkbook.Sheets.Add
        ws.Name = "분수대소데이터"
    End If
    On Error GoTo 0
    
    ' 전략 구성: 4번(직관) 7번(단위분수) 8번(대분수) 6번(분모통분) 각 1개
    ' 1번(분자통분) 2번(어림산) 각 2개 / 3번(정밀보수) 진1, 가1 고정
    Dim types As Variant
    types = Array(1, 1, 2, 2, 4, 6, 7, 8, 301, 302) ' 301:진분수보수, 302:가분수보수
    For i = 1 To 10: strategies(i) = types(i - 1): Next i
    
    ' 랜덤 섞기
    Randomize
    For i = 1 To 10
        randIdx = Int(Rnd * 10) + 1
        temp = strategies(i): strategies(i) = strategies(randIdx): strategies(randIdx) = temp
    Next i
    
    ws.Cells.Clear
    ws.Range("A1:H1").Value = Array("유형", "분자1", "분모1", "vs", "분자2", "분모2", "전략명", "정답")
    
    r = 2: case8Count = 0
    
    For i = 1 To 10
        strategy = strategies(i): attempt = 0: strategyName = ""
        Do
            attempt = attempt + 1
            n1 = 1: d1 = 1: n2 = 1: d2 = 1
            
            Select Case strategy
                Case 1 ' [분자 통분]
                    If Rnd < 0.7 Then
                        n1 = RandBetween(11, 25): temp = RandBetween(2, 4): n2 = n1 * temp
                        d1 = RandBetween(157, 397): d2 = (d1 * temp) + RandBetween(-3, 3)
                    Else
                        Dim bf As Long: bf = RandBetween(11, 15): n1 = bf * 2: n2 = bf * 3
                        d1 = RandBetween(151, 299): d2 = Int(d1 * 1.5) + RandBetween(-2, 2)
                    End If
                    strategyName = "분자통분"
                    
                Case 6 ' [분모 통분]
                    Dim f_val As Long, a_val As Long, b_val As Long
                    f_val = Choose(RandBetween(1, 4), 4, 6, 8, 9)
                    Do: a_val = RandBetween(3, 7): b_val = RandBetween(3, 7): Loop Until a_val <> b_val And GetVbaGcd(a_val, b_val) = 1
                    d1 = f_val * a_val: d2 = f_val * b_val
                    n1 = RandBetween(2, d1 - 1): n2 = Int(n1 * b_val / a_val) + IIf(Rnd > 0.5, 1, -1)
                    If n2 <= 0 Then n2 = 1: If n2 >= d2 Then n2 = d2 - 1
                    strategyName = "분모통분"

                Case 2 ' [고난도 어림] ★ 기준값(bD) 곱할 때 받아올림 원천 차단
                    Dim bN As Long, bD As Long
                    Select Case RandBetween(1, 3): Case 1: bN = 1: bD = 2: Case 2: bN = 1: bD = 3: Case 3: bN = 1: bD = 4: End Select
                    Dim m1 As Long, m2 As Long
                    
                    ' n1 * bD 시 일의 자리에서 받아올림이 발생하지 않도록 강제
                    Do
                        m1 = RandBetween(151, 249)
                        n1 = Int(bN * (m1 / bD)) + RandBetween(1, 3)
                    Loop Until (n1 Mod 10) * bD < 10
                    d1 = m1
                    
                    ' n2 * bD 시 일의 자리에서 받아올림이 발생하지 않도록 강제
                    Do
                        m2 = RandBetween(251, 449)
                        n2 = Int(bN * (m2 / bD)) - RandBetween(1, 3)
                        If n2 < 1 Then n2 = 1
                    Loop Until (n2 Mod 10) * bD < 10
                    d2 = m2
                    strategyName = "고난도어림"

                Case 301 ' [정밀 보수비교 - 진분수]
                    commonDiff = RandBetween(11, 45)
                    Do: d1 = RandBetween(157, 443): n1 = d1 - commonDiff
                    Loop Until (d1 Mod 10 >= commonDiff Mod 10) And ((d1 \ 10) Mod 10 >= (commonDiff \ 10) Mod 10)
                    Do: d2 = RandBetween(461, 947): n2 = d2 - commonDiff
                    Loop Until (d2 Mod 10 >= commonDiff Mod 10) And ((d2 \ 10) Mod 10 >= (commonDiff \ 10) Mod 10) And d1 <> d2
                    strategyName = "정밀보수(진)"
                    
                Case 302 ' [정밀 보수비교 - 가분수]
                    commonDiff = RandBetween(11, 45)
                    Do: d1 = RandBetween(157, 443): n1 = d1 + commonDiff
                    Loop Until (n1 Mod 10 >= d1 Mod 10) And ((n1 \ 10) Mod 10 >= (d1 \ 10) Mod 10)
                    Do: d2 = RandBetween(461, 947): n2 = d2 + commonDiff
                    Loop Until (n2 Mod 10 >= d2 Mod 10) And ((n2 \ 10) Mod 10 >= (d2 \ 10) Mod 10) And d1 <> d2
                    strategyName = "정밀보수(가)"
                    
                Case 4 ' [직관 비교]
                    n1 = RandBetween(25, 45): d1 = RandBetween(401, 599): n2 = n1 + RandBetween(15, 30): d2 = d1 - RandBetween(51, 149)
                    strategyName = "직관비교"
                    
                Case 7 ' [단위분수 근접]
                    Dim bz_val As Long: bz_val = RandBetween(3, 5): n1 = RandBetween(15, 35): d1 = n1 * bz_val + 1: n2 = RandBetween(15, 35): d2 = n2 * bz_val - 1
                    strategyName = "단위분수"

                Case 8 ' [대분수 변환]
                    Dim nt1 As Long, nt2 As Long: nt1 = RandBetween(2, 5): nt2 = nt1 + IIf(Rnd > 0.5, 1, -1)
                    If nt2 < 2 Then nt2 = 2
                    d1 = Choose(RandBetween(1, 4), 101, 111, 121, 201): Do: d2 = Choose(RandBetween(1, 3), 13, 17, 19): Loop While d1 = d2
                    n1 = d1 * nt1 + RandBetween(1, d1 - 1): n2 = d2 * nt2 + RandBetween(1, d2 - 1)
                    strategyName = "대분수"
            End Select
            
            ' 무한루프 방지 및 기약분수 체크
            If attempt > 5000 Then Exit Do
        Loop Until (GetVbaGcd(n1, d1) = 1 And GetVbaGcd(n2, d2) = 1 And n1 <> n2 And d1 <> d2)
        
        ' 좌우 섞기
        If Rnd > 0.5 Then
            temp = n1: n1 = n2: n2 = temp
            temp = d1: d1 = d2: d2 = temp
        End If
        
        If n1 * d2 > n2 * d1 Then result = ">" Else result = "<"
        ws.Cells(r, 1) = IIf(strategy > 300, 3, strategy)
        ws.Cells(r, 2) = n1: ws.Cells(r, 3) = d1: ws.Cells(r, 4) = "vs": ws.Cells(r, 5) = n2: ws.Cells(r, 6) = d2
        ws.Cells(r, 7) = strategyName: ws.Cells(r, 8) = result: r = r + 1
    Next i
    ws.Columns("A:H").AutoFit
    Application.Calculation = xlCalculationAutomatic: Application.ScreenUpdating = True
End Sub

Function GetVbaGcd(ByVal a As Long, ByVal b As Long) As Long
    Dim t As Long: a = Abs(a): b = Abs(b)
    If a = 0 Or b = 0 Then GetVbaGcd = 1: Exit Function
    Do While b <> 0: t = a Mod b: a = b: b = t: Loop
    GetVbaGcd = a
End Function

Function RandBetween(Low As Long, High As Long) As Long
    RandBetween = Int((High - Low + 1) * Rnd + Low)
End Function
