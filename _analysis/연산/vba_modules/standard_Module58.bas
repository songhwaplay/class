Attribute VB_Name = "Module58"
Sub first개수_답()
Attribute first개수_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first개수_답 매크로
'

'
    Range("B6,B9,B12,k6,k9,k12,b19,b22,b25").Select
    Range("B25").Activate
 
    
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
   
    Range("B6").Select
End Sub
Sub first개수_문제()
Attribute first개수_문제.VB_ProcData.VB_Invoke_Func = " \n14"
'
' first개수_문제 매크로
'

'
    Range("B6,B9,B12,k6,k9,k12,b19,b22,b25").Select
    Range("B25").Activate
 
    

    With Selection.Font
        .ThemeColor = xlThemeColorDark1
        .TintAndShade = 0
    End With
  
    Range("B6").Select
End Sub
