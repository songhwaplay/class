Attribute VB_Name = "Module12"
Sub sixth비례식_답()
Attribute sixth비례식_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' sixth비례식_답 매크로
'

'
    Range("E4:G4,L4,C12,K12,D19,F24,H29").Select
    Range("F24").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("J6").Select
End Sub
Sub sixth비례식_문제()
Attribute sixth비례식_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' sixth비례식_문제 매크로
'

'
    Range("E4:G4,L4,C12,K12,D19,F24,H29").Select
    Range("F24").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("H7").Select
End Sub
