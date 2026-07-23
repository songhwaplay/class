Attribute VB_Name = "Module1"
Sub first덧셈뺄셈4_답()
Attribute first덧셈뺄셈4_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first덧셈뺄셈4_답 매크로
'

'
    Range( _
        "E3,E5,A7,E9,E11,C13,E15,E17,A19,C21,G3,I5,M3,M5,M7,G7,I9,K11,I13,G15,I17,I21,K19,O21,M19,M17,Q15,O13,M11,Q9" _
        ).Select
    Range("Q9").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("E3").Select
End Sub
Sub first덧셈뺄셈3_문제()
Attribute first덧셈뺄셈3_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first덧셈뺄셈3_문제 매크로
'

'
    Range( _
        "E3,E5,A7,E9,E11,C13,E15,E17,A19,C21,I21,K19,I17,G15,I13,K11,I9,G7,I5,G3,M3,M5,M7,Q9,M11,O13,Q15,M17,M19,O21" _
        ).Select
    Range("O21").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("E3").Select
End Sub


Sub sixth소수A_새로고침()


    Dim i As Integer, j As Integer, num1 As Long, num2 As Long, problemCount As Integer
    Dim baseDenom As Long, baseNum As Long, factor As Integer
    Dim ws As Worksheet, validProblem As Boolean
    Dim countEasyAns As Integer, ans As Double
    Dim usedProblems As String, countOverOne As Integer
    Dim probArray(1 To 18, 1 To 4) As Variant
    
    On Error Resume Next
    Set ws = Sheets("6자연수원본")
    On Error GoTo 0
    If ws Is Nothing Then Exit Sub
    
    problemCount = 18
    countEasyAns = 0: countOverOne = 0: usedProblems = "|"
    ws.Cells.Clear
    ws.Cells.Font.Name = "맑은 고딕": ws.Cells.Font.Size = 12
    Randomize
    
    For i = 1 To problemCount
        validProblem = False
        Do While Not validProblem
            ' 1. 제수 후보군 (2, 4, 5, 8, 20, 25, 50)
            baseDenom = Choose(Int(Rnd * 7) + 1, 2, 4, 5, 8, 20, 25, 50)
            
            ' 2. 피제수(기약분수 분자) 생성
            If countOverOne < 5 Then
                baseNum = Int(Rnd * (baseDenom * 5)) + baseDenom + 1
            Else
                baseNum = IIf(baseDenom > 2, Int(Rnd * (baseDenom - 2)) + 2, 0)
            End If
            
            ' 3. 기약분수 검증
            If baseNum > 1 And WorksheetFunction.Gcd(baseNum, baseDenom) = 1 Then
                ans = baseNum / baseDenom
                
                ' 4. [핵심 로직] 암기 시리즈 필터링 및 강제 변장
                ' (0.5, 0.25, 0.75, 0.125, 0.375, 0.625, 0.875, 0.2, 0.4, 0.6, 0.8)
                Select Case ans
                    Case 0.5, 0.25, 0.75, 0.125, 0.375, 0.625, 0.875, 0.2, 0.4, 0.6, 0.8
                        ' 암기 시리즈는 무조건 약분이 필요하도록 factor를 2~6 사이로 설정
                        factor = Int(Rnd * 5) + 2
                    Case Else
                        ' 그 외 문제는 있는 그대로(factor=1) 혹은 변장(factor>1) 랜덤 적용
                        factor = Int(Rnd * 3) + 1
                End Select
                
                num1 = baseNum * factor
                num2 = baseDenom * factor
                
                ' 5. 중복 및 제약 체크
                If InStr(usedProblems, "|" & num1 & "/" & num2 & "|") = 0 Then
                    ' 피제수 10의 배수 제외, 정수 몫 제외
                    If num1 Mod 10 <> 0 And num1 Mod num2 <> 0 Then
                        
                        ' 몫 1 초과 카운트 관리
                        If ans > 1 Then
                            If countOverOne < 5 Then
                                countOverOne = countOverOne + 1
                                validProblem = True
                            End If
                        Else
                            validProblem = True
                        End If
                    End If
                End If
            End If
        Loop
        usedProblems = usedProblems & num1 & "/" & num2 & "|"
        probArray(i, 2) = num1: probArray(i, 3) = num2: probArray(i, 4) = ans
    Next i
    
    ' 6. 셔플 알고리즘
    For i = problemCount To 2 Step -1
        j = Int(Rnd * i) + 1
        Dim tB, tC, tD: tB = probArray(i, 2): tC = probArray(i, 3): tD = probArray(i, 4)
        probArray(i, 2) = probArray(j, 2): probArray(i, 3) = probArray(j, 3): probArray(i, 4) = probArray(j, 4)
        probArray(j, 2) = tB: probArray(j, 3) = tC: probArray(j, 4) = tD
    Next i
    
    ' 7. 시트 출력
    ws.Range("A1:D1").Value = Array("번호", "피제수", "제수", "정답")
    For i = 1 To problemCount
        ws.Cells(i + 1, 1).Value = i
        ws.Cells(i + 1, 2).Value = probArray(i, 2)
        ws.Cells(i + 1, 3).Value = probArray(i, 3)
        ws.Cells(i + 1, 4).Value = probArray(i, 4)
    Next i
    With ws.Range("A1:D" & problemCount + 1): .HorizontalAlignment = xlCenter: .Borders.LineStyle = xlContinuous: End With
    ws.Columns("A:D").AutoFit
End Sub
