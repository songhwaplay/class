Attribute VB_Name = "Module16"



Sub 길이_문제()
Attribute 길이_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' 길이_문제 매크로
'

'
    Range("A2:O2,A5:O5,A7:O7,A10:O10").Select
    Range("A10").Activate
   
    Range("A2:O2,A5:O5,A7:O7,A10:O10,A17:O17,A20:O20,A22:O23,O23").Select
    Range("O23").Activate
   
    Range("A2:O2,A5:O5,A7:O7,A10:O10").Select
    Range("A10").Activate
   
    Range("A2:O2,A5:O5,A7:O7,A10:O10,A17:O17,A20:O20,A22:O22,A25:O25").Select
    Range("A25").Activate
   
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
 
    Range("K3").Select
End Sub
Sub 무게들이_문제()
Attribute 무게들이_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' 무게들이_문제 매크로
'

'
    Range("A2:O2,A5:O5,A10:O10,A7:O7").Select
    Range("A7").Activate
    Range("A2:O2,A5:O5,A10:O10,A7:O7,A17:O17,A20:O20,A22:O22,A25:O25").Select
    Range("A25").Activate
    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
    Range("f1").Select
End Sub
