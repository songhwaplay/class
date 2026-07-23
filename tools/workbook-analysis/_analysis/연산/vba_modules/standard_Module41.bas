Attribute VB_Name = "Module41"

Sub first보수_답()
Attribute first보수_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first보수_답 매크로
'

'
    Range( _
        "E21,I21,S21,S19,S17,S15,S13,S11,S9,S7,S5,S3,G19,E19,E17,I17,G15,E15,E13,I13,G11,E11,E9,I9,G7,E7,E5,I5,G3,E3" _
        ).Select
    Range("E3").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("E3").Select
End Sub
Sub first보수_문제()
Attribute first보수_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first보수_문제 매크로
'

'
    Range( _
        "E3,G3,E5,I5,G7,E7,E9,I9,G11,E11,E13,I13,G15,E15,E17,I17,G19,E19,E21,I21,S21,S19,S17,S15,S13,S11,S9,S7,S5,S3" _
        ).Select
    Range("S3").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("E3").Select
End Sub
