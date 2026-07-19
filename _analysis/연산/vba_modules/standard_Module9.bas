Attribute VB_Name = "Module9"
Sub 길이_답()
Attribute 길이_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' 길이_답 매크로
'

'
    Range("2:2,5:5,10:10").Select
    Range("A10").Activate
  
    Range("2:2,5:5,10:10,17:17").Select
    Range("A17").Activate
    
    Range("2:2,5:5,10:10,17:17,20:20,25:25").Select
    Range("A25").Activate
   
    With Selection.Font
         With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    
    Range("M6").Select
End With
End Sub
Sub 무게들이_답()
Attribute 무게들이_답.VB_ProcData.VB_Invoke_Func = " \n14"
'
' 무게들이_답 매크로
'

'
    Range("2:2,5:5,10:10").Select
    Range("A10").Activate
    Range("2:2,5:5,10:10,17:17,20:20,25:25").Select
    Range("A25").Activate
    With Selection.Font
        .Color = -11489280
        .TintAndShade = 0
    End With
    Range("f1").Select
End Sub

