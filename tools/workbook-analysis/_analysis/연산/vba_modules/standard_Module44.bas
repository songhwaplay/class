Attribute VB_Name = "Module44"

Sub first뛰어세기_문제()
Attribute first뛰어세기_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first뛰어세기_문제 매크로
'

'
    Range( _
        "F4,J4,H6,J6,L6,J8,H8,F8,F10,D10,H10,j10,F12,F14,J14,J12,N12,L16,J16,J18,H18,H16,F18,F20,H20,D20,j20,F22,J22,N22" _
        ).Select
    Range("N22").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("f1").Select
End Sub
