Attribute VB_Name = "Module59"
Sub 이름표숨기기()
Attribute 이름표숨기기.VB_ProcData.VB_Invoke_Func = " \n14"
'
' 이름표숨기기 매크로
'

'
    ActiveSheet.Shapes.Range(Array("Picture 6")).Select
    Selection.PrintObject = msoFalse
    Application.CommandBars("Format Object").Visible = False
End Sub
Sub 이름표넣기()
Attribute 이름표넣기.VB_ProcData.VB_Invoke_Func = " \n14"
'
' 이름표넣기 매크로
'

'
    ActiveSheet.Shapes.Range(Array("Picture 6")).Select
    Selection.PrintObject = msoTrue
    Application.CommandBars("Format Object").Visible = False
End Sub
Sub fourth나눗셈_답()
Attribute fourth나눗셈_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fourth나눗셈_답 매크로
'

'
    Range("C5:J5,C14:J14,C23:J23,C31:J31").Select
    Range("C31").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("C5").Select
End Sub
Sub fourth나눗셈_문제()
Attribute fourth나눗셈_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fourth나눗셈_문제 매크로
'

'
    Range( _
        "C5:D5,F5:G5,I5:J5,C14:D14,F14:G14,I14:J14,C23:D23,F23:G23,I23:J23,C31:D31,F31:G31,I31:J31" _
        ).Select
    Range("I31").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("C5").Select
End Sub
Sub fourth소수_답()
Attribute fourth소수_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fourth소수_답 매크로
'

'
    Range("F3,M3,F9,M9,F15,M15,F21,M21,F27,M27").Select
    Range("M27").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("F3").Select
End Sub
Sub fourth소수_문제()
Attribute fourth소수_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' fourth소수_문제 매크로
'

'
    Range("F3,M3,M9,F9,F15,M15,F21,M21").Select
    Range("M21").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("F3").Select
End Sub
