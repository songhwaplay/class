Attribute VB_Name = "Module2"
Sub second시계A_답()
Attribute second시계A_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' second시계A_답 매크로
'

'
    Range("B9,E9,H9,H11,E11,B11,B21,E21,H21,H23,E23,B23,B32,E32,H32,H34,E34,B34"). _
        Select
    Range("B34").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("B9").Select
End Sub
Sub second시계A_문제()
Attribute second시계A_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' second시계A_문제 매크로
'

'
    Range("E9,E11,H9,H11,B21,B23,E21,E23,H21,H23,B32,B34,E32,E34,H32,H34").Select
    Range("H34").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("B9").Select
End Sub
