(function (root, factory) {
    const data = factory();
    if (typeof module === "object" && module.exports) module.exports = data;
    root.IDIOM_DATA = data;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";

    const entries = [
        {
            id: "sujudaeto", word: "수주대토", hanja: "守株待兔", theme: "지혜",
            meaning: "낡은 경험에만 매달리거나 노력 없이 우연한 행운을 기다림.",
            story: "송나라의 한 농부가 밭을 갈다가 토끼 한 마리가 나무 그루터기에 부딪혀 죽는 것을 보았습니다. 뜻밖에 토끼를 얻은 농부는 농사를 그만두고 날마다 그루터기만 지켰지만, 두 번째 토끼는 오지 않았고 사람들의 웃음거리가 되었습니다.",
            lesson: "한 번의 우연을 언제나 통하는 방법처럼 믿어서는 안 됩니다.",
            source: "《한비자(韓非子)》 〈오두(五蠹)〉", sourceNote: "원문에 농부와 토끼 이야기가 직접 기록되어 있습니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=39&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "gakjuguggeom", word: "각주구검", hanja: "刻舟求劍", theme: "지혜",
            meaning: "상황이 달라졌는데도 옛 방법만 고집하여 융통성이 없음.",
            story: "초나라 사람이 배를 타고 강을 건너다 칼을 물에 빠뜨렸습니다. 그는 칼이 떨어진 배 옆면에 표시를 새겨 두었다가 배가 멈춘 뒤 그 자리에서 물로 뛰어들었습니다. 배는 움직였지만 칼은 움직이지 않았으니 찾을 수 없었습니다.",
            lesson: "환경이 변하면 판단과 방법도 함께 바뀌어야 합니다.",
            source: "《여씨춘추(呂氏春秋)》 〈찰금(察今)〉", sourceNote: "시대가 달라지면 법도 달라져야 한다는 설명에 쓰인 비유입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=43&webMd=2", verification: "원전 확인"
        },
        {
            id: "josammosa", word: "조삼모사", hanja: "朝三暮四", theme: "지혜",
            meaning: "눈앞의 차이만 보고 결과가 같은 줄 모르거나, 잔꾀로 남을 속임.",
            story: "원숭이를 기르던 사람이 도토리를 아침에 세 개, 저녁에 네 개 주겠다고 하자 원숭이들이 화를 냈습니다. 아침에 네 개, 저녁에 세 개 주겠다고 바꾸자 원숭이들은 기뻐했습니다. 하루에 받는 수는 똑같이 일곱 개였습니다.",
            lesson: "말이나 순서보다 실제로 달라지는 것이 무엇인지 살펴야 합니다.",
            source: "《장자(莊子)》 〈제물론(齊物論)〉", sourceNote: "본래는 이름만 다르고 실질은 같음을 설명하는 이야기입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-6&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "gwayubulgeup", word: "과유불급", hanja: "過猶不及", theme: "지혜",
            meaning: "지나친 것은 모자란 것과 마찬가지로 좋지 않음.",
            story: "자공이 공자에게 자장과 자하 가운데 누가 더 나은지 물었습니다. 공자는 자장은 지나치고 자하는 미치지 못한다고 답했습니다. 자공이 그러면 자장이 낫냐고 묻자, 공자는 지나친 것도 미치지 못한 것과 같다고 말했습니다.",
            lesson: "무조건 많이 하는 것보다 알맞은 정도를 찾는 일이 중요합니다.",
            source: "《논어(論語)》 〈선진(先進)〉", sourceNote: "공자와 제자 자공의 문답에서 나온 표현입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-1439&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "saeongjima", word: "새옹지마", hanja: "塞翁之馬", theme: "지혜",
            meaning: "인생의 화와 복은 바뀔 수 있어 미리 판단하기 어려움.",
            story: "변방 노인의 말이 달아났지만 노인은 복이 될지 모른다고 했습니다. 말은 좋은 말들을 데리고 돌아왔고, 그 말을 타던 아들은 다리가 부러졌습니다. 뒤이어 전쟁이 일어났을 때 아들은 다친 다리 덕분에 징집되지 않아 목숨을 지켰습니다.",
            lesson: "당장의 행운과 불행만으로 마지막 결과를 단정하지 마세요.",
            source: "《회남자(淮南子)》 〈인간훈(人間訓)〉", sourceNote: "말의 상실부터 전쟁까지 이어지는 이야기가 기록되어 있습니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-536&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "ugongisan", word: "우공이산", hanja: "愚公移山", theme: "노력",
            meaning: "어려운 일도 끈기 있게 계속하면 끝내 이룰 수 있음.",
            story: "아흔 살에 가까운 우공은 집 앞을 가로막은 두 산을 가족과 함께 옮기기 시작했습니다. 지수가 비웃자 우공은 자신이 죽어도 자손이 계속하면 산은 더 커지지 않으니 언젠가 끝난다고 답했습니다. 그 정성에 감동한 하늘이 산을 옮겨 주었습니다.",
            lesson: "큰 목표도 포기하지 않고 이어 가면 조금씩 현실이 바뀝니다.",
            source: "《열자(列子)》 〈탕문(湯問)〉", sourceNote: "우공과 지수의 논쟁을 통해 끈기의 힘을 보여 줍니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-268&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "hogahowi", word: "호가호위", hanja: "狐假虎威", theme: "관계",
            meaning: "남의 권세를 빌려 위세를 부림.",
            story: "호랑이에게 잡힌 여우는 자신이 모든 짐승의 우두머리라며 앞장서 걸어 보겠다고 했습니다. 짐승들은 여우 뒤의 호랑이를 보고 달아났지만, 호랑이는 모두가 여우를 무서워한다고 믿었습니다. 여우는 호랑이의 위세를 빌려 위기를 벗어났습니다.",
            lesson: "겉으로 드러난 위세가 누구의 힘에서 나오는지 살펴야 합니다.",
            source: "《윤문자(尹文子)》 일문·《전국책》 〈초책〉", sourceNote: "가장 이른 전승과 널리 알려진 《전국책》 판본을 함께 확인했습니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=32&la=0&webMd=2", verification: "전승 비교"
        },
        {
            id: "eobujiri", word: "어부지리", hanja: "漁父之利", theme: "관계",
            meaning: "둘이 다투는 사이에 엉뚱한 제삼자가 이익을 얻음.",
            story: "도요새가 조개의 살을 쪼자 조개가 껍데기를 닫아 새의 부리를 물었습니다. 서로 놓아주지 않고 버티는 동안 어부가 지나가 둘을 한꺼번에 잡았습니다. 소대는 이 비유로 조나라가 연나라를 치면 강한 진나라만 이익을 본다고 설득했습니다.",
            lesson: "고집스러운 다툼은 두 편 모두를 약하게 만들 수 있습니다.",
            source: "《전국책(戰國策)》 〈연책 이(燕策二)〉", sourceNote: "도요새와 조개의 비유가 외교를 만류하는 이야기 속에 나옵니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=1471&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "samyeonchoga", word: "사면초가", hanja: "四面楚歌", theme: "역사",
            meaning: "사방이 적에게 둘러싸여 도움받을 곳이 없는 상태.",
            story: "해하에서 한나라 군대에 포위된 항우의 군대는 병사도 식량도 부족했습니다. 밤이 되자 사방의 한나라 군대에서 초나라 노래가 들렸고, 항우는 초나라 땅이 이미 모두 넘어갔다고 생각했습니다. 병사들의 마음은 무너지고 항우는 고립되었습니다.",
            lesson: "힘뿐 아니라 사람들의 마음과 사기도 승패를 좌우합니다.",
            source: "《사기(史記)》 〈항우본기(項羽本紀)〉", sourceNote: "해하 전투에서 항우가 초나라 노래를 듣는 장면입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=41&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "dadaikseon", word: "다다익선", hanja: "多多益善", theme: "역사",
            meaning: "많으면 많을수록 더욱 좋음.",
            story: "한 고조 유방이 한신에게 자신은 군사를 얼마나 거느릴 수 있느냐고 묻자 한신은 십만 정도라고 답했습니다. 유방이 한신 자신은 어떠냐고 묻자, 한신은 자신은 병사가 많으면 많을수록 더 잘 지휘할 수 있다고 말했습니다.",
            lesson: "양이 많을수록 좋은지는 그것을 다룰 능력과 상황에 달려 있습니다.",
            source: "《사기(史記)》 〈회음후열전(淮陰侯列傳)〉", sourceNote: "유방과 한신이 장수의 능력을 논한 대화에서 나왔습니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=957&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "wanbyeokgwijo", word: "완벽귀조", hanja: "完璧歸趙", theme: "역사",
            meaning: "빌리거나 맡은 물건을 조금도 상하지 않게 주인에게 돌려줌.",
            story: "진나라 왕이 조나라의 보물 화씨벽을 성 열다섯 개와 바꾸자고 했습니다. 사신 인상여는 진왕에게 성을 줄 뜻이 없음을 알아채고 꾀를 내어 보물을 다시 손에 넣었습니다. 그는 사람을 시켜 화씨벽을 조나라로 몰래 돌려보냈습니다.",
            lesson: "불리한 상황에서도 침착함과 책임감이 소중한 것을 지킵니다.",
            source: "《사기(史記)》 〈염파인상여열전(廉頗藺相如列傳)〉", sourceNote: "인상여가 화씨벽을 온전히 조나라로 돌려보낸 일화입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-341&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "mungyeongjigyo", word: "문경지교", hanja: "刎頸之交", theme: "관계",
            meaning: "목숨까지 내놓을 수 있을 만큼 깊고 굳은 우정.",
            story: "장군 염파는 말로 공을 세운 인상여가 자신보다 높은 자리에 오른 것을 못마땅해했습니다. 인상여가 두 사람의 싸움은 강한 진나라만 돕는다며 계속 피했다는 말을 듣자, 염파는 가시나무를 등에 지고 찾아가 사죄했습니다. 두 사람은 생사를 함께할 벗이 되었습니다.",
            lesson: "공동체를 먼저 생각하고 잘못을 인정할 때 진짜 신뢰가 생깁니다.",
            source: "《사기(史記)》 〈염파인상여열전〉", sourceNote: "부형청죄 이야기 뒤에 두 사람이 문경지교를 맺었다고 기록됩니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-1139&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "jirokwima", word: "지록위마", hanja: "指鹿爲馬", theme: "역사",
            meaning: "사실을 일부러 뒤집어 옳고 그름을 어지럽힘.",
            story: "진나라의 권신 조고가 황제에게 사슴을 바치면서 말이라고 주장했습니다. 신하들 가운데 사슴이라고 바로 말한 사람들은 뒤에 벌을 받았고, 두려운 사람들은 조고의 말에 맞장구쳤습니다. 조고는 이를 통해 자신에게 맞설 사람이 누구인지 시험했습니다.",
            lesson: "권력이 진실을 바꾸려 할수록 사실을 확인하는 태도가 중요합니다.",
            source: "《사기(史記)》 〈진시황본기(秦始皇本紀)〉", sourceNote: "조고가 신하들의 복종 여부를 시험한 사건입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=11&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "tosagupaeng", word: "토사구팽", hanja: "兔死狗烹", theme: "관계",
            meaning: "일이 끝난 뒤 필요 없어진 공로자를 버리거나 해침.",
            story: "월나라를 떠난 범려는 문종에게 편지를 보내, 새를 다 잡으면 좋은 활을 감추고 토끼를 다 잡으면 사냥개를 삶는다고 경고했습니다. 어려움을 함께한 공신도 목적을 이룬 군주에게 버림받을 수 있으니 떠나라는 뜻이었습니다.",
            lesson: "도움을 준 사람의 공을 잊고 필요가 끝났다고 버려서는 안 됩니다.",
            source: "《회남자》 〈설림훈〉·《사기》 〈월왕구천세가〉", sourceNote: "비유의 이른 기록과 범려의 경고 일화를 함께 확인했습니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-126&la=0&webMd=2", verification: "전승 비교"
        },
        {
            id: "samgochoryeo", word: "삼고초려", hanja: "三顧草廬", theme: "관계",
            meaning: "인재를 얻기 위해 진심을 다해 여러 번 찾아감.",
            story: "유비는 뛰어난 인재 제갈량이 숨어 산다는 말을 듣고 몸소 찾아갔습니다. 두 번이나 만나지 못했지만 포기하지 않고 세 번째로 초가집을 방문했습니다. 유비의 정성에 마음이 움직인 제갈량은 세상으로 나와 그를 돕기로 했습니다.",
            lesson: "귀한 사람의 마음을 얻으려면 지위보다 존중과 진심이 먼저입니다.",
            source: "《삼국지(三國志)》 〈제갈량전〉·제갈량 〈출사표〉", sourceNote: "정사와 제갈량 자신의 글에 세 차례 방문이 기록되어 있습니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=1100&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "sueojigyo", word: "수어지교", hanja: "水魚之交", theme: "관계",
            meaning: "물과 물고기처럼 떨어질 수 없는 매우 가까운 사이.",
            story: "유비가 제갈량을 무척 가까이하자 관우와 장비는 서운해했습니다. 유비는 자신에게 제갈량이 있는 것은 물고기에게 물이 있는 것과 같다며 더는 불평하지 말라고 했습니다. 큰 뜻을 이루는 데 꼭 필요한 동반자라는 뜻이었습니다.",
            lesson: "서로의 능력을 살려 주는 관계는 혼자일 때보다 큰 힘을 냅니다.",
            source: "《삼국지(三國志)》 〈촉서·제갈량전〉", sourceNote: "원문의 ‘물고기가 물을 얻은 것 같다’는 비유에서 발전한 표현입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=187&webMd=2", verification: "원전 확인"
        },
        {
            id: "cheongchureoram", word: "청출어람", hanja: "靑出於藍", theme: "배움",
            meaning: "제자나 후배가 스승이나 선배보다 더 뛰어나짐.",
            story: "순자는 푸른 물감이 쪽풀에서 나오지만 쪽풀보다 더 푸르고, 얼음은 물로 만들어지지만 물보다 더 차갑다고 말했습니다. 배움을 멈추지 않으면 원래의 바탕을 넘어 더 나아질 수 있음을 설명한 비유입니다.",
            lesson: "배움은 받은 것을 그대로 지키는 데서 끝나지 않고 더 발전시키는 일입니다.",
            source: "《순자(荀子)》 〈권학(勸學)〉", sourceNote: "학문을 멈추지 말라는 글의 첫머리에 나오는 비유입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-15&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "tasanjiseok", word: "타산지석", hanja: "他山之石", theme: "배움",
            meaning: "다른 사람의 하찮은 말이나 행동도 자신을 닦는 데 도움이 됨.",
            story: "《시경》의 노래에는 다른 산의 거친 돌도 옥을 가는 데 쓸 수 있다는 구절이 나옵니다. 내 산의 돌이 아니고 보잘것없어 보여도 단단한 옥을 다듬는 도구가 될 수 있다는 비유입니다.",
            lesson: "나와 다른 사람의 경험에서도 배울 점을 찾을 수 있습니다.",
            source: "《시경(詩經)》 〈소아·학명(小雅·鶴鳴)〉", sourceNote: "‘다른 산의 돌로도 옥을 갈 수 있다’는 시구에서 나왔습니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=7383&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "iljacheongeum", word: "일자천금", hanja: "一字千金", theme: "배움",
            meaning: "글 한 자의 가치가 매우 크거나 문장이 아주 훌륭함.",
            story: "여불위는 여러 학자의 글을 모아 《여씨춘추》를 완성한 뒤 함양의 성문에 내걸었습니다. 글에서 한 글자라도 더하거나 뺄 수 있는 사람에게 천금을 주겠다고 했습니다. 이 일로 책과 여불위의 명성이 널리 퍼졌습니다.",
            lesson: "좋은 글은 단어 하나까지 이유 있게 고르고 다듬어야 합니다.",
            source: "《사기(史記)》 〈여불위열전(呂不韋列傳)〉", sourceNote: "책을 공개하고 한 글자를 고치면 천금을 주겠다고 한 일화입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-522&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "nakyangjiga", word: "낙양지가", hanja: "洛陽紙價", theme: "배움",
            meaning: "훌륭한 글이 크게 유행하여 널리 읽히고 베껴짐.",
            story: "서진의 좌사는 여러 해에 걸쳐 〈삼도부〉를 썼지만 처음에는 주목받지 못했습니다. 유명한 학자들이 글의 가치를 알아보고 추천하자 낙양 사람들이 앞다투어 베껴 썼고, 종이가 모자라 가격까지 올랐다고 합니다.",
            lesson: "정성껏 만든 작품은 늦게라도 가치를 알아보는 사람을 만날 수 있습니다.",
            source: "《진서(晉書)》 〈문원열전·좌사〉", sourceNote: "〈삼도부〉가 유행해 낙양의 종이값이 올랐다는 기록입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-100&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "hwaryongjeomjeong", word: "화룡점정", hanja: "畫龍點睛", theme: "배움",
            meaning: "가장 중요한 부분을 보태어 전체를 훌륭하게 완성함.",
            story: "화가 장승요가 절 벽에 용 네 마리를 그리면서 눈동자는 그리지 않았습니다. 눈을 그리면 용이 날아간다는 말을 사람들이 믿지 않자 두 마리에 눈동자를 찍었습니다. 곧 천둥이 치고 두 용이 벽을 뚫고 날아갔다는 전설입니다.",
            lesson: "작은 한 부분이 전체의 생명력을 결정할 때가 있습니다.",
            source: "《역대명화기(歷代名畫記)》 권7·《습유기(拾遺記)》", sourceNote: "장승요 설화와 그보다 이른 ‘점안 뒤 날아감’ 기록을 함께 확인했습니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-383&la=0&webMd=2", verification: "전승 비교"
        },
        {
            id: "gwanpojigyo", word: "관포지교", hanja: "管鮑之交", theme: "관계",
            meaning: "서로를 깊이 이해하고 믿어 주는 참된 우정.",
            story: "관중과 포숙아가 함께 장사할 때 관중이 이익을 더 가져가도 포숙아는 그가 가난하기 때문임을 이해했습니다. 관중이 여러 번 실패해도 능력이 없어서가 아니라 때를 못 만난 것이라 믿었습니다. 훗날 포숙아는 자신 대신 관중을 재상으로 추천했습니다.",
            lesson: "좋은 친구는 겉으로 드러난 실패보다 사람의 사정과 가능성을 봅니다.",
            source: "《사기(史記)》 〈관안열전(管晏列傳)〉", sourceNote: "관중이 포숙아를 ‘나를 알아준 사람’이라 회고하는 기록입니다.",
            reference: "https://ctext.org/shiji/guan-yan-lie-zhuan/zh", verification: "원전 확인"
        },
        {
            id: "maengmosamcheon", word: "맹모삼천", hanja: "孟母三遷", theme: "배움",
            meaning: "자녀 교육을 위해 좋은 환경을 고르려는 부모의 정성.",
            story: "어린 맹자가 무덤 가까이 살 때 장례 흉내를 내자 어머니는 시장 근처로 이사했습니다. 이번에는 장사꾼 흉내를 내어 다시 글방 가까이 옮겼습니다. 맹자가 예절과 공부를 따라 하는 것을 보고서야 그곳에 자리 잡았습니다.",
            lesson: "사람은 주변에서 보고 듣는 것에 큰 영향을 받습니다.",
            source: "《열녀전(列女傳)》 〈모의전·추맹가모〉", sourceNote: "맹자의 어머니가 교육 환경을 찾아 옮긴 전승의 이른 기록입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=8572&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "gyeolchooseun", word: "결초보은", hanja: "結草報恩", theme: "관계",
            meaning: "죽어서라도 잊지 않고 은혜를 갚음.",
            story: "위과는 아버지가 정신이 맑을 때 남긴 뜻에 따라 아버지의 첩을 순장시키지 않고 다른 사람에게 시집보냈습니다. 뒤에 전쟁터에서 한 노인이 풀을 묶어 적장 두회의 발을 걸어 위과가 승리하도록 도왔습니다. 꿈에 나타난 노인은 구해 준 여인의 아버지라고 밝혔습니다.",
            lesson: "사람을 살리고 베푼 선의는 오래 기억되어 돌아올 수 있습니다.",
            source: "《좌전(左傳)》 〈선공 십오년〉", sourceNote: "‘결초’ 일화가 직접 기록되어 있으며 결초보은은 이를 풀어 쓴 표현입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-1795&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "pajukjise", word: "파죽지세", hanja: "破竹之勢", theme: "역사",
            meaning: "대나무를 쪼개듯 막힘없이 나아가는 매우 강한 기세.",
            story: "서진의 장수 두예가 오나라를 공격해 연이어 승리하자 일부 장수들은 장마와 질병을 걱정해 멈추자고 했습니다. 두예는 지금의 기세는 대나무를 쪼개는 것과 같아 몇 마디만 가르면 나머지는 칼날을 따라 저절로 갈라진다고 주장했습니다. 공격은 계속되었고 오나라는 무너졌습니다.",
            lesson: "좋은 흐름이 왔을 때는 위험을 살피면서도 기회를 놓치지 않아야 합니다.",
            source: "《진서(晉書)》 〈두예열전(杜預列傳)〉", sourceNote: "두예가 진격을 계속하자며 든 대나무 비유입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=24&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "gungyeilhak", word: "군계일학", hanja: "群鷄一鶴", theme: "인물",
            meaning: "평범한 사람들 가운데 홀로 매우 뛰어난 사람.",
            story: "죽림칠현 혜강의 아들 혜소가 처음 낙양에 왔을 때, 그를 본 사람이 왕융에게 감탄하며 말했습니다. 사람들 속에 선 혜소의 크고 빼어난 모습이 마치 닭 무리 속에 선 들학과 같다는 것이었습니다.",
            lesson: "참된 실력과 품성은 요란하게 꾸미지 않아도 드러납니다.",
            source: "진(晉) 대규(戴逵) 〈죽림칠현론〉·《진서》 〈혜소전〉", sourceNote: "‘학이 닭 무리에 선 듯하다’는 인물평에서 발전한 표현입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=217&powerMode=1", verification: "전승 비교"
        },
        {
            id: "hyeongseoljigong", word: "형설지공", hanja: "螢雪之功", theme: "노력",
            meaning: "어려운 형편에서도 부지런히 공부하여 이룬 성과.",
            story: "차윤은 등잔 기름이 부족하자 여름밤에 반딧불이를 주머니에 모아 그 빛으로 책을 읽었다고 합니다. 손강은 겨울밤 눈에 비친 빛을 이용해 공부했다고 전합니다. 두 이야기가 합쳐져 어려움을 이겨 낸 공부를 뜻하게 되었습니다.",
            lesson: "좋은 조건을 기다리기보다 지금 가능한 방법을 찾아 꾸준히 해 보세요.",
            source: "《진서(晉書)》 〈차윤전〉·손강 영설 전승", sourceNote: "‘반딧불’과 ‘눈빛’이라는 서로 다른 일화가 합쳐진 성어입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=25751&la=0&webMd=1", verification: "전승 비교"
        },
        {
            id: "baegajeolhyeon", word: "백아절현", hanja: "伯牙絶絃", theme: "관계",
            meaning: "자기를 진정으로 알아주는 벗을 잃은 슬픔 또는 참된 지기의 귀함.",
            story: "거문고의 명인 백아가 높은 산을 생각하며 연주하면 종자기는 산의 뜻을 알아들었고, 흐르는 물을 생각하면 강물의 뜻을 알아들었습니다. 종자기가 죽자 백아는 자신의 음악을 알아줄 사람이 없다며 줄을 끊고 다시는 연주하지 않았습니다.",
            lesson: "마음을 깊이 이해해 주는 한 사람은 무엇과도 바꾸기 어렵습니다.",
            source: "《여씨춘추(呂氏春秋)》 〈본미(本味)〉·《열자》 〈탕문〉", sourceNote: "고산유수와 절현 이야기가 두 고전에 나뉘어 전합니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=26189&la=0&webMd=2", verification: "전승 비교"
        },
        {
            id: "wasinsangdam", word: "와신상담", hanja: "臥薪嘗膽", theme: "노력",
            meaning: "목표를 이루기 위해 괴로움을 참고 견디며 스스로를 단련함.",
            story: "월왕 구천은 오왕 부차에게 패해 큰 치욕을 겪었습니다. 나라로 돌아온 뒤 쓸개를 곁에 두고 맛보며 굴욕을 잊지 않았고, 백성과 함께 힘을 길러 마침내 오나라를 이겼습니다. ‘섶에 눕는다’는 요소는 후대 전승 속에서 결합되었습니다.",
            lesson: "실패를 원망하는 데 그치지 않고 오래 준비하면 다시 기회를 만들 수 있습니다.",
            source: "《사기(史記)》 〈월왕구천세가〉·후대 전승", sourceNote: "《사기》 원문은 구천이 쓸개를 맛본 일을 분명히 기록하며, ‘와신’의 결합 과정은 후대 전승을 함께 살펴야 합니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-199&la=0&webMd=2", verification: "전승 비교"
        },
        {
            id: "namgailmong", word: "남가일몽", hanja: "南柯一夢", theme: "지혜",
            meaning: "부귀영화와 인생의 득실이 한바탕 꿈처럼 덧없음.",
            story: "순우분은 큰 홰나무 아래에서 술에 취해 잠들었습니다. 꿈속에서 괴안국의 부마가 되고 남가군의 태수가 되어 오랜 세월 부귀와 몰락을 모두 겪었습니다. 깨어 보니 잠깐 사이였고, 꿈속 나라는 나무 아래 개미굴이었습니다.",
            lesson: "눈앞의 성공과 실패가 삶의 전부인 것처럼 매달리지 마세요.",
            source: "당 이공좌(李公佐) 《남가태수전(南柯太守傳)》", sourceNote: "역사서가 아니라 당나라 전기소설에서 유래한 성어입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-192&la=0&webMd=2", verification: "문헌 확인"
        },
        {
            id: "daegimanseong", word: "대기만성", hanja: "大器晩成", theme: "노력",
            meaning: "큰 인물은 오랜 시간과 노력을 거쳐 늦게 이루어짐.",
            story: "《노자》는 아주 큰 그릇은 쉽게 완성되지 않고, 아주 큰 소리는 오히려 잘 들리지 않으며, 아주 큰 형상은 일정한 모양이 없다고 말합니다. 눈앞에 드러난 빠른 성과만으로 큰 가능성을 판단할 수 없다는 뜻으로 풀이되어 왔습니다.",
            lesson: "성장이 늦다고 조급해하지 말고 자기 속도로 실력을 쌓아 가세요.",
            source: "《노자(老子)》 제41장", sourceNote: "사건을 담은 고사가 아니라 철학적 문장에서 유래했습니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-156&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "ongojisin", word: "온고지신", hanja: "溫故知新", theme: "배움",
            meaning: "배운 것을 되풀이해 익히면서 새로운 깨달음을 얻음.",
            story: "공자는 옛날에 배운 내용을 다시 익히고 그 안에서 새로운 뜻을 깨달을 수 있다면 남을 가르칠 만하다고 말했습니다. 단순히 외운 것을 반복하는 데 그치지 않고, 다시 생각하며 새롭게 이해하는 공부를 강조한 말입니다.",
            lesson: "복습은 뒤로 돌아가는 일이 아니라 더 깊이 이해하기 위한 출발점입니다.",
            source: "《논어(論語)》 〈위정(爲政)〉", sourceNote: "‘옛것을 익혀 새것을 안다’는 공자의 말에서 나온 표현입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=1010&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "bulchihamun", word: "불치하문", hanja: "不恥下問", theme: "배움",
            meaning: "자기보다 나이나 지위가 낮은 사람에게 묻는 것을 부끄러워하지 않음.",
            story: "자공이 공자에게 위나라의 공어가 왜 ‘문’이라는 시호를 받았는지 물었습니다. 공자는 그가 영리하면서도 배우기를 좋아했고, 자기보다 아랫사람에게 묻는 일을 부끄러워하지 않았기 때문이라고 답했습니다.",
            lesson: "모르는 것을 솔직히 묻는 태도가 진짜 배움의 시작입니다.",
            source: "《논어(論語)》 〈공야장(公冶長)〉", sourceNote: "공어의 배움 자세를 평가한 공자의 답에서 유래했습니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=167&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "yubimuhwan", word: "유비무환", hanja: "有備無患", theme: "지혜",
            meaning: "미리 준비해 두면 걱정할 일이 생기지 않음.",
            story: "은나라의 재상 부열은 임금에게 일을 시작할 때 좋은 방법과 알맞은 때를 살피고, 모든 일에 미리 대비해야 걱정을 피할 수 있다고 조언했습니다. 이 말은 뒤에 《좌전》에도 인용되어 널리 알려졌습니다.",
            lesson: "작은 준비 하나가 큰 어려움을 막아 줄 수 있습니다.",
            source: "《서경(書經)》 〈열명중(說命中)〉·《좌전》 양공 11년", sourceNote: "《서경》의 문장을 《좌전》이 다시 인용한 표현입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=140&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "jeolchatakma", word: "절차탁마", hanja: "切磋琢磨", theme: "배움",
            meaning: "서로 배우고 연구하며 학문이나 인격을 더욱 갈고닦음.",
            story: "《시경》은 훌륭한 군자를 뼈와 상아를 자르고 다듬으며, 옥과 돌을 쪼고 가는 모습에 비유했습니다. 좋은 재료도 여러 번 손질해야 빛나는 물건이 되듯 사람도 배우고 고치며 성장한다는 뜻입니다.",
            lesson: "친구와 생각을 나누고 서로 고쳐 주면 혼자 공부할 때보다 더 크게 자랍니다.",
            source: "《시경(詩經)》 〈위풍·기오(衛風·淇奧)〉", sourceNote: "네 가지 재료를 다듬는 공정을 사람의 수양에 빗댄 시구입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=858&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "giu", word: "기우", hanja: "杞憂", theme: "지혜",
            meaning: "아무 근거 없이 앞일을 지나치게 걱정함.",
            story: "기나라의 한 사람은 하늘이 무너지고 땅이 꺼지면 몸 둘 곳이 없다며 밥도 잠도 잊었습니다. 다른 사람이 하늘과 땅의 이치를 차근차근 설명해 주자 그제야 걱정을 내려놓았습니다.",
            lesson: "걱정이 생기면 상상만 키우지 말고 사실과 근거부터 확인해 보세요.",
            source: "《열자(列子)》 〈천서(天瑞)〉", sourceNote: "‘기인우천(杞人憂天)’의 고사에서 나온 두 글자 말입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=37&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "yeonmokgueo", word: "연목구어", hanja: "緣木求魚", theme: "지혜",
            meaning: "방법이 잘못되어 아무리 애써도 목적을 이룰 수 없음.",
            story: "맹자는 힘으로 다른 나라를 굴복시켜 천하를 얻으려는 제나라 선왕에게, 백성을 돌보지 않은 채 그런 목표를 이루려는 것은 나무에 올라가 물고기를 찾는 일과 같다고 말했습니다.",
            lesson: "노력하기 전에 지금 쓰는 방법이 목표에 맞는지 먼저 살펴야 합니다.",
            source: "《맹자(孟子)》 〈양혜왕 상(梁惠王上)〉", sourceNote: "맹자가 잘못된 정치 방법을 나무 위의 물고기 찾기에 비유했습니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=86&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "mangyangboro", word: "망양보뢰", hanja: "亡羊補牢", theme: "지혜",
            meaning: "실수한 뒤라도 바로 고치면 더 큰 피해를 막을 수 있음.",
            story: "초나라 신하 장신은 잘못된 신하들과 어울리는 왕에게 위험을 경고했지만 받아들여지지 않았습니다. 나라가 크게 어려워진 뒤 왕이 후회하자, 장신은 토끼를 본 뒤 사냥개를 돌아보고 양을 잃은 뒤 우리를 고쳐도 아직 늦지 않다고 말했습니다.",
            lesson: "이미 생긴 실수만 탓하지 말고 지금 할 수 있는 보완부터 시작하세요.",
            source: "《전국책(戰國策)》 〈초책 사(楚策四)〉", sourceNote: "장신이 초 양왕에게 다시 시작할 수 있다고 권한 비유입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-484&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "nomajiji", word: "노마지지", hanja: "老馬之智", theme: "지혜",
            meaning: "경험이 많은 사람에게서 얻을 수 있는 지혜.",
            story: "관중이 제 환공을 따라 전쟁터에서 돌아오다가 길을 잃었습니다. 관중은 늙은 말이 길을 기억할 것이라 생각해 앞세웠고, 군대는 그 말을 따라 무사히 돌아가는 길을 찾았습니다.",
            lesson: "새로운 지식뿐 아니라 오래 쌓인 경험에도 귀 기울여야 합니다.",
            source: "《한비자(韓非子)》 〈설림 상(說林上)〉", sourceNote: "원전의 ‘늙은 말의 지혜를 쓸 수 있다’는 문장에서 나온 말입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=36&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "gyemyeonggudo", word: "계명구도", hanja: "鷄鳴狗盜", theme: "역사",
            meaning: "보잘것없어 보이는 재주도 때에 따라 도움이 될 수 있음.",
            story: "진나라에 갇힌 맹상군을 구하려고 한 식객은 개 흉내를 내어 궁궐 창고에서 여우 가죽옷을 가져왔습니다. 맹상군이 도망치다 함곡관에 막히자 다른 식객이 닭 울음소리를 내어 성문을 일찍 열게 했고, 일행은 무사히 빠져나왔습니다.",
            lesson: "사람의 재주를 겉모습이나 이름만 보고 하찮게 여기지 마세요.",
            source: "《사기(史記)》 〈맹상군열전(孟嘗君列傳)〉", sourceNote: "개 흉내와 닭 울음 흉내로 맹상군을 구한 두 식객의 일화입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=474&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "mosujacheon", word: "모수자천", hanja: "毛遂自薦", theme: "인물",
            meaning: "스스로 나서서 자신을 적임자라고 추천함.",
            story: "평원군이 초나라에 함께 갈 사람 스무 명을 뽑았지만 한 명이 부족했습니다. 문객 모수는 스스로 따라가겠다고 나섰고, 초나라 왕 앞에서 당당히 연합의 필요성을 설명해 약속을 받아 냈습니다.",
            lesson: "준비된 사람이라면 필요한 순간에 용기를 내어 기회를 요청할 수 있습니다.",
            source: "《사기(史記)》 〈평원군우경열전(平原君虞卿列傳)〉", sourceNote: "모수가 스스로 일행에 들기를 청하고 실제로 임무를 완수한 이야기입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=291&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "nangjungjichu", word: "낭중지추", hanja: "囊中之錐", theme: "인물",
            meaning: "재능이 뛰어난 사람은 숨어 있어도 실력이 드러남.",
            story: "평원군은 자신을 추천한 모수에게, 뛰어난 사람은 자루 속에 넣은 송곳처럼 끝이 곧 드러나는 법인데 왜 지금까지 알려지지 않았느냐고 물었습니다. 모수는 이제야 자루 속에 넣어 달라고 청한 것이라 답했고, 뒤에 큰 공을 세웠습니다.",
            lesson: "재능은 기회를 만날 때 드러나며, 그 기회를 잡을 준비도 필요합니다.",
            source: "《사기(史記)》 〈평원군우경열전(平原君虞卿列傳)〉", sourceNote: "모수자천 이야기 속 ‘자루 안의 송곳’ 비유에서 나온 표현입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=291&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "owoldongju", word: "오월동주", hanja: "吳越同舟", theme: "관계",
            meaning: "서로 사이가 나쁜 사람도 어려움 앞에서는 힘을 합침.",
            story: "손자는 원수 사이인 오나라 사람과 월나라 사람이 같은 배를 탔을 때 거센 바람을 만나면 서로 왼손과 오른손처럼 돕게 된다고 설명했습니다. 공동의 위험 앞에서는 오랜 다툼보다 협력이 먼저라는 뜻입니다.",
            lesson: "생각이 다른 사람과도 함께 풀어야 할 문제 앞에서는 협력할 수 있습니다.",
            source: "《손자(孫子)》 〈구지(九地)〉", sourceNote: "오나라와 월나라 사람을 같은 배에 태운 비유에서 유래했습니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=7245&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "sunmangchihan", word: "순망치한", hanja: "脣亡齒寒", theme: "관계", level: "중급",
            meaning: "서로 밀접한 관계라서 한쪽이 망하면 다른 쪽도 위험해짐.",
            story: "진나라가 괵나라를 치기 위해 우나라에 길을 빌려 달라고 했습니다. 궁지기는 우나라 임금에게 입술이 없어지면 이가 시리듯 괵나라가 망하면 우나라도 안전하지 못하다고 경고했지만, 임금은 듣지 않았고 결국 두 나라 모두 멸망했습니다.",
            lesson: "가까이 연결된 사람이나 공동체의 어려움을 남의 일로만 보면 안 됩니다.",
            source: "《좌전(左傳)》 희공 5년", sourceNote: "우나라와 괵나라의 관계를 입술과 이에 빗댄 충고입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=5375&la=0&webMd=2", verification: "원전 확인"
        },
        {
            id: "dongbyeongsangryeon", word: "동병상련", hanja: "同病相憐", theme: "관계",
            meaning: "비슷한 어려움을 겪는 사람끼리 서로 이해하고 가엾게 여김.",
            story: "초나라에서 억울한 일을 겪고 오나라로 온 백비를 오자서가 믿고 받아들였습니다. 까닭을 묻자 오자서는 자신과 백비가 같은 원한과 아픔을 지녔다며 ‘같은 병을 앓는 사람끼리 서로 가엾게 여긴다’는 노래를 들려주었습니다.",
            lesson: "비슷한 아픔을 겪은 경험은 다른 사람을 이해하고 돕는 힘이 됩니다.",
            source: "한 조엽(趙曄) 《오월춘추(吳越春秋)》 〈합려내전〉", sourceNote: "오자서가 백비를 믿은 까닭을 설명하며 인용한 노래에서 나왔습니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-847&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "gwontojungrae", word: "권토중래", hanja: "捲土重來", theme: "노력",
            meaning: "실패한 뒤 힘을 다시 모아 새롭게 도전함.",
            story: "당나라 시인 두목은 항우가 패해 죽은 오강의 정자를 지나며 시를 지었습니다. 항우가 강동으로 돌아가 다시 힘을 모았다면 먼지를 일으키며 돌아올 수 있었을지도 모른다고 생각한 것입니다.",
            lesson: "한 번의 실패로 모든 가능성이 끝나는 것은 아닙니다.",
            source: "당 두목(杜牧) 〈제오강정(題烏江亭)〉", sourceNote: "항우의 마지막 선택을 돌아본 시구 ‘권토중래미가지’에서 유래했습니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=636&la=0&webMd=1", verification: "문헌 확인"
        },
        {
            id: "jeonhwawibok", word: "전화위복", hanja: "轉禍爲福", theme: "지혜",
            meaning: "어려운 일을 잘 처리하여 오히려 좋은 결과로 바꿈.",
            story: "《사기》는 옛날에 일을 잘 처리한 사람은 재앙을 복으로 돌리고 실패를 공으로 만들었다고 말합니다. 하나의 인물 이야기라기보다 위기 속에서도 방법을 찾아 결과를 바꾸는 지혜를 강조한 문장입니다.",
            lesson: "어려움 자체보다 그 뒤에 어떻게 대응하느냐가 다음 결과를 바꿉니다.",
            source: "《사기(史記)》 〈소진열전(蘇秦列傳)〉", sourceNote: "‘화를 복으로 돌리고 실패를 공으로 삼는다’는 문장에서 나온 표현입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=9794&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "baejungsayeong", word: "배중사영", hanja: "杯中蛇影", theme: "지혜", level: "중급",
            meaning: "쓸데없는 의심과 두려움으로 스스로 괴로워함.",
            story: "두선은 잔 속에 뱀이 있는 듯한 모습을 보고도 술을 마신 뒤 병이 났습니다. 나중에 벽에 걸린 활의 그림자가 술잔에 비쳐 뱀처럼 보였다는 사실을 알자 두려움이 풀리고 병도 나았습니다.",
            lesson: "두려운 마음이 들 때는 내가 본 것이 사실인지 차분히 확인해 보세요.",
            source: "한 응소(應劭) 《풍속통의(風俗通義)》·후대 전승", sourceNote: "‘배궁사영’과 ‘배중사영’으로 전하는 같은 계열의 이야기입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=5202&la=0&webMd=1", verification: "전승 비교"
        },
        {
            id: "yangsanggunja", word: "양상군자", hanja: "梁上君子", theme: "인물",
            meaning: "도둑을 완곡하게 이르는 말.",
            story: "진식은 밤에 집 안으로 들어와 들보 위에 숨은 도둑을 발견했습니다. 그는 소리쳐 잡는 대신 자손들을 불러 사람은 스스로 힘써야 하며 나쁜 사람도 본래부터 악한 것은 아니라면서 ‘들보 위의 군자’를 예로 들었습니다. 부끄러워 내려온 도둑에게는 다시 살 길도 마련해 주었습니다.",
            lesson: "잘못을 꾸짖을 때에도 사람이 달라질 가능성을 남겨 줄 수 있습니다.",
            source: "진 화교(華嶠) 《후한서》 진식 일화", sourceNote: "현존 인용문과 후대 《후한서》 기록을 통해 전하는 이야기입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-382&la=0&webMd=2", verification: "문헌 확인"
        },
        {
            id: "chomokgaebyeong", word: "초목개병", hanja: "草木皆兵", theme: "역사",
            meaning: "겁에 질려 풀과 나무까지 모두 적군처럼 보임.",
            story: "전진의 부견은 동진 군대와 싸우기 전 성에 올라 적진을 살폈습니다. 동진 군대의 진영이 매우 정돈된 데다 멀리 팔공산의 풀과 나무까지 군사처럼 보여 크게 두려워했습니다. 뒤이어 부견의 군대는 비수 전투에서 패했습니다.",
            lesson: "불안이 커질수록 눈앞의 사실을 침착하게 구분해야 합니다.",
            source: "《진서(晉書)》 〈부견재기 하(苻堅載記下)〉", sourceNote: "비수 전투를 앞둔 부견의 두려움을 묘사한 기록입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-20&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "baekbalbaekjung", word: "백발백중", hanja: "百發百中", theme: "노력",
            meaning: "쏠 때마다 맞힌다는 뜻으로, 기술이나 예상이 매우 정확함.",
            story: "초나라의 양유기는 백 걸음 밖의 버드나무 잎을 쏘아 화살 백 발을 모두 맞힐 만큼 뛰어난 명궁이었습니다. 한 사람은 계속 쏘다 지치면 단 한 발의 실수로 앞선 공이 사라질 수 있다며 알맞을 때 멈추는 지혜도 필요하다고 충고했습니다.",
            lesson: "뛰어난 실력은 꾸준한 연습과 자기 상태를 살피는 판단에서 나옵니다.",
            source: "《전국책(戰國策)》 〈서주책(西周策)〉", sourceNote: "명궁 양유기의 활쏘기와 그에게 건넨 충고에서 나온 표현입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=248&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "deungyongmun", word: "등용문", hanja: "登龍門", theme: "인물",
            meaning: "출세하거나 성공하기 위해 반드시 넘어야 하는 중요한 관문.",
            story: "후한의 관리 이응은 인품과 명망이 높아 젊은 선비들이 만나 인정받기를 큰 영광으로 여겼습니다. 사람들은 이응에게 받아들여지는 일을, 잉어가 거센 용문을 뛰어넘어 용이 되는 것에 빗대어 ‘용문에 오른다’고 불렀습니다.",
            lesson: "중요한 기회를 통과하려면 그만큼의 실력과 준비를 쌓아야 합니다.",
            source: "《후한서(後漢書)》 〈이응열전(李膺列傳)〉", sourceNote: "이응에게 인정받은 선비를 ‘용문에 올랐다’고 부른 기록에서 유래했습니다.",
            reference: "https://ctext.org/dictionary.pl?char=%E7%99%BB%E9%BE%8D%E9%96%80&if=gb", verification: "원전 확인"
        },
        {
            id: "mosun", word: "모순", hanja: "矛盾", theme: "지혜",
            meaning: "말이나 행동의 앞뒤가 서로 맞지 않음.",
            story: "초나라의 한 상인이 어떤 창도 막아 낼 수 있는 방패와 어떤 방패도 뚫을 수 있는 창을 판다고 자랑했습니다. 누군가 그 창으로 그 방패를 찌르면 어떻게 되느냐고 묻자 상인은 아무 말도 하지 못했습니다.",
            lesson: "주장을 할 때는 앞뒤의 말이 서로 맞는지 살펴보아야 합니다.",
            source: "《한비자(韓非子)》 〈난일(難一)〉", sourceNote: "창을 뜻하는 ‘모’와 방패를 뜻하는 ‘순’이 한 단어가 된 고사입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=89&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "sajok", word: "사족", hanja: "蛇足", theme: "지혜",
            meaning: "필요 없이 덧붙여 오히려 일을 망치는 말이나 행동.",
            story: "여러 사람이 땅에 뱀을 가장 빨리 그리는 사람이 술을 마시기로 했습니다. 먼저 다 그린 사람은 시간이 남자 뱀에게 발까지 그려 넣었고, 두 번째 사람이 뱀에는 원래 발이 없다며 술을 가져갔습니다.",
            lesson: "완성된 일에 욕심을 내어 불필요한 것을 덧붙이지 마세요.",
            source: "《전국책(戰國策)》 〈제책 이(齊策二)〉", sourceNote: "‘화사첨족(畫蛇添足)’ 이야기에서 ‘뱀의 발’만 남아 쓰이는 말입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-23&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "baekmi", word: "백미", hanja: "白眉", theme: "인물",
            meaning: "여럿 가운데 가장 뛰어난 사람이나 사물.",
            story: "촉나라의 마씨 형제 다섯은 모두 재주가 있었는데, 그중 마량이 가장 뛰어났습니다. 마량은 눈썹 사이에 흰 털이 있어 고향 사람들은 ‘마씨 집안의 다섯 인재 가운데 흰 눈썹의 마량이 으뜸’이라고 불렀습니다.",
            lesson: "눈에 띄는 특징보다 꾸준히 쌓은 실력이 사람을 으뜸으로 만듭니다.",
            source: "《삼국지(三國志)》 〈마량전(馬良傳)〉", sourceNote: "마량의 흰 눈썹과 뛰어난 재능을 함께 칭찬한 말에서 나왔습니다.",
            reference: "https://dict.revised.moe.edu.tw/dictView.jsp?ID=26978&la=0&powerMode=0", verification: "원전 확인"
        },
        {
            id: "gyereuk", word: "계륵", hanja: "鷄肋", theme: "역사",
            meaning: "큰 쓸모는 없지만 버리기에는 아까운 것.",
            story: "조조가 한중을 두고 싸우다가 진격할지 물러날지 고민하며 암호로 ‘닭의 갈비’를 내렸습니다. 양수는 닭갈비가 먹을 것은 적지만 버리기는 아깝듯, 조조가 한중을 포기하려 한다는 뜻으로 알아들었습니다.",
            lesson: "아까움 때문에 붙잡고 있는 것이 정말 필요한지 냉정하게 판단할 때도 있습니다.",
            source: "《삼국지(三國志)》 〈무제기〉 배송지 주 인용 《구주춘추》", sourceNote: "조조의 군중 암호를 양수가 해석한 일화에서 나온 말입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=22770&la=0&webMd=1", verification: "문헌 확인"
        },
        {
            id: "toego", word: "퇴고", hanja: "推敲", theme: "배움",
            meaning: "글의 표현을 여러 번 생각하며 더 알맞게 다듬음.",
            story: "당나라 시인 가도는 시 속의 한 글자를 ‘밀다’로 할지 ‘두드리다’로 할지 고민하며 길에서도 손짓을 해 보았습니다. 마침 만난 한유가 ‘두드리다’가 더 좋겠다고 조언했고, 두 글자는 글을 다듬는 일을 뜻하게 되었습니다.",
            lesson: "좋은 글은 한 번에 완성되기보다 여러 번 고쳐 쓰며 만들어집니다.",
            source: "《유공가화록(劉公嘉話錄)》을 인용한 후대 문헌", sourceNote: "가도가 ‘推’와 ‘敲’ 가운데 한 글자를 고심한 문학 일화입니다.",
            reference: "https://dict.concised.moe.edu.tw/dictView.jsp?ID=11716&la=0&powerMode=0", verification: "문헌 확인"
        },
        {
            id: "osipbobaekbo", word: "오십보백보", hanja: "五十步百步", theme: "지혜",
            meaning: "차이가 조금 있을 뿐 잘못이나 처지가 사실상 비슷함.",
            story: "맹자는 전쟁터에서 백 걸음 달아난 병사를 오십 걸음 달아난 병사가 비웃는다면 어떻겠느냐고 양혜왕에게 물었습니다. 왕은 둘 다 달아난 것은 같다고 답했고, 맹자는 왕의 정치도 이웃 나라와 크게 다르지 않음을 일깨웠습니다.",
            lesson: "남의 잘못을 비웃기 전에 나에게도 비슷한 잘못이 없는지 돌아보세요.",
            source: "《맹자(孟子)》 〈양혜왕 상(梁惠王上)〉", sourceNote: "원문의 ‘오십보소백보(五十步笑百步)’를 우리말에서 줄여 쓰는 형태입니다.",
            reference: "https://dict.idioms.moe.edu.tw/idiomView.jsp?ID=-384&la=0&webMd=1", verification: "원전 확인"
        },
        {
            id: "sipjungpalgu", word: "십중팔구", hanja: "十中八九", theme: "지혜",
            meaning: "열 가운데 여덟이나 아홉이라는 뜻으로, 거의 틀림없이 그러함.",
            story: "열 번 가운데 여덟 번이나 아홉 번은 같은 결과가 나온다는 말입니다. 가능성이 매우 높아 거의 확실한 상황을 나타냅니다.",
            lesson: "가능성이 높더라도 예외는 있을 수 있으므로 마지막까지 확인하는 태도가 필요합니다.",
            source: "일반 한자성어", sourceNote: "열 십, 가운데 중, 여덟 팔, 아홉 구를 써서 대부분 그러하다는 뜻입니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%8B%AD%EC%A4%91%ED%8C%94%EA%B5%AC", verification: "사전 확인"
        },
        {
            id: "cheonsinmango", word: "천신만고", hanja: "千辛萬苦", theme: "노력",
            meaning: "천 가지 매운 것과 만 가지 쓴 것이라는 뜻으로, 온갖 어려운 고비.",
            story: "셀 수 없이 많은 맵고 쓴 일을 겪는다는 표현입니다. 목적을 이루기까지 수많은 고생과 어려움을 견딘 상황을 나타냅니다.",
            lesson: "힘든 과정에서 얻은 경험은 다음 어려움을 이겨 내는 든든한 힘이 됩니다.",
            source: "일반 한자성어", sourceNote: "일천 천, 매울 신, 일만 만, 쓸 고를 써서 매우 많은 고생을 나타냅니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%B2%9C%EC%8B%A0%EB%A7%8C%EA%B3%A0", verification: "사전 확인"
        },
        {
            id: "samsaileon", word: "삼사일언", hanja: "三思一言", theme: "지혜",
            meaning: "세 번 생각한 뒤 한 번 말한다는 뜻으로, 말을 신중히 함.",
            story: "한마디를 하기 전에 여러 번 깊이 생각하라는 가르침입니다. 한번 내뱉은 말은 되돌리기 어려우므로 말의 영향까지 살펴야 한다는 뜻입니다.",
            lesson: "중요한 말을 하기 전에는 사실인지, 필요한지, 상대를 배려하는지 먼저 생각해야 합니다.",
            source: "일반 한자성어", sourceNote: "석 삼, 생각 사, 한 일, 말씀 언을 써서 신중한 말하기를 강조합니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%82%BC%EC%82%AC%EC%9D%BC%EC%96%B8", verification: "사전 확인"
        },
        {
            id: "geungeomjeoryak", word: "근검절약", hanja: "勤儉節約", theme: "노력",
            meaning: "부지런하고 검소하게 생활하며 아껴 씀.",
            story: "맡은 일에 부지런히 힘쓰고, 필요한 만큼만 쓰며 낭비하지 않는 생활 태도를 함께 이르는 말입니다.",
            lesson: "작은 물건과 시간도 소중히 쓰는 습관이 모이면 안정된 생활과 큰 성과로 이어집니다.",
            source: "일반 한자성어", sourceNote: "부지런할 근, 검소할 검, 마디 절, 맺을 약을 써서 부지런하고 알뜰한 생활을 뜻합니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EA%B7%BC%EA%B2%80%EC%A0%88%EC%95%BD", verification: "사전 확인"
        },
        {
            id: "jamunjadap", word: "자문자답", hanja: "自問自答", theme: "지혜",
            meaning: "스스로 묻고 스스로 대답함.",
            story: "자신에게 질문을 던지고 그 답을 스스로 찾아가는 모습을 나타냅니다. 생각을 정리하거나 문제의 해답을 깊이 탐색할 때 쓰입니다.",
            lesson: "무엇을 모르는지 스스로 묻고 답을 찾아보면 생각하는 힘과 문제 해결력이 자랍니다.",
            source: "일반 한자성어", sourceNote: "스스로 자, 물을 문, 스스로 자, 대답 답을 써서 혼자 묻고 답하는 모습을 뜻합니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%9E%90%EB%AC%B8%EC%9E%90%EB%8B%B5", verification: "사전 확인"
        },
        {
            id: "bulmungaji", word: "불문가지", hanja: "不問可知", theme: "지혜",
            meaning: "묻지 않아도 능히 알 수 있음.",
            story: "직접 묻거나 자세히 설명을 듣지 않아도 드러난 단서와 상황만으로 충분히 알 수 있다는 뜻입니다.",
            lesson: "주변을 세심하게 살피면 말로 설명하지 않은 사실도 스스로 알아차릴 수 있습니다.",
            source: "일반 한자성어", sourceNote: "아닐 불, 물을 문, 옳을 가, 알 지를 써서 묻지 않아도 알 수 있다는 뜻입니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EB%B6%88%EB%AC%B8%EA%B0%80%EC%A7%80", verification: "사전 확인"
        },
        {
            id: "suguchosim", word: "수구초심", hanja: "首丘初心", theme: "관계",
            meaning: "여우가 죽을 때 머리를 고향 언덕으로 둔다는 뜻으로, 고향을 그리워하는 마음.",
            story: "《예기》에는 여우가 죽을 때 자신이 살던 언덕 쪽으로 머리를 둔다는 이야기가 전합니다. 근본과 고향을 잊지 않는 마음을 비유합니다.",
            lesson: "새로운 곳에서 살아가더라도 자신이 자란 곳과 처음의 마음을 소중히 여겨야 합니다.",
            source: "《예기(禮記)》 〈단궁상(檀弓上)〉", sourceNote: "여우가 죽을 때 머리를 자기가 살던 언덕으로 향한다는 구절과 관련된 표현입니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%88%98%EA%B5%AC%EC%B4%88%EC%8B%AC", verification: "원전·사전 확인"
        },
        {
            id: "yongdusami", word: "용두사미", hanja: "龍頭蛇尾", theme: "지혜",
            meaning: "시작은 훌륭하지만 끝이 흐지부지하고 약해짐.",
            story: "머리는 위엄 있는 용인데 꼬리는 가느다란 뱀이라는 모습에 빗댄 말입니다. 처음의 기세와 달리 마무리가 보잘것없는 상황을 나타냅니다.",
            lesson: "좋은 시작만큼 끝까지 책임 있게 마무리하는 태도가 중요합니다.",
            source: "중국 고전에서 유래한 한자성어", sourceNote: "용의 머리와 뱀의 꼬리를 대비하여 시작과 끝의 차이를 나타냅니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%9A%A9%EB%91%90%EC%82%AC%EB%AF%B8", verification: "사전 확인"
        },
        {
            id: "cheonjaeilu", word: "천재일우", hanja: "千載一遇", theme: "지혜",
            meaning: "천 년에 한 번 만날 정도로 좀처럼 얻기 어려운 좋은 기회.",
            story: "천 년이라는 긴 세월 동안 한 번 만날까 말까 한 귀한 만남이나 기회를 뜻합니다. 다시 오기 어려운 때를 놓치지 말라는 의미로 쓰입니다.",
            lesson: "좋은 기회가 찾아왔을 때 알아보고 붙잡을 수 있도록 평소에 준비해야 합니다.",
            source: "중국 고전에서 유래한 한자성어", sourceNote: "일천 천, 해 재, 한 일, 만날 우를 써서 매우 드문 기회를 나타냅니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%B2%9C%EC%9E%AC%EC%9D%BC%EC%9A%B0", verification: "사전 확인"
        },
        {
            id: "gogunbuntu", word: "고군분투", hanja: "孤軍奮鬪", theme: "노력",
            meaning: "도와주는 사람 없이 혼자 힘으로 힘겹게 싸우거나 노력함.",
            story: "지원군이 없는 외로운 군대가 홀로 온 힘을 다해 싸운다는 말입니다. 오늘날에는 어려운 일을 혼자 애써 해결하는 상황에도 널리 쓰입니다.",
            lesson: "혼자 버티는 용기도 중요하지만, 필요할 때 도움을 요청하고 협력하는 지혜도 필요합니다.",
            source: "일반 한자성어", sourceNote: "외로울 고, 군사 군, 떨칠 분, 싸울 투를 써서 홀로 힘껏 노력하는 모습을 나타냅니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EA%B3%A0%EA%B5%B0%EB%B6%84%ED%88%AC", verification: "사전 확인"
        },
        {
            id: "gojingamrae", word: "고진감래", hanja: "苦盡甘來", theme: "노력",
            meaning: "쓴 것이 다하면 단 것이 온다는 뜻으로, 고생 끝에 즐거움이 찾아옴.",
            story: "쓴맛을 견딘 뒤 단맛을 느낀다는 자연스러운 경험에 빗대어, 어려운 시기를 참고 이겨 내면 좋은 때가 온다는 뜻을 전합니다.",
            lesson: "지금의 어려움만 보고 포기하지 말고, 꾸준히 노력하며 좋은 결과를 기다려야 합니다.",
            source: "일반 한자성어", sourceNote: "괴로울 고, 다할 진, 달 감, 올 래를 써서 고생 뒤의 기쁨을 나타냅니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EA%B3%A0%EC%A7%84%EA%B0%90%EB%9E%98", verification: "사전 확인"
        },
        {
            id: "isimjeonsim", word: "이심전심", hanja: "以心傳心", theme: "관계",
            meaning: "말이나 글을 쓰지 않고 마음에서 마음으로 뜻을 전함.",
            story: "석가모니가 대중 앞에서 말없이 꽃을 들어 보이자 가섭만 그 뜻을 알아차리고 미소 지었다는 선종의 염화미소 설화와 함께 전해집니다.",
            lesson: "깊은 이해와 공감은 많은 말이 없어도 서로의 뜻을 알아차리게 합니다.",
            source: "선종의 염화미소 설화", sourceNote: "마음으로 마음을 전한다는 선종의 가르침을 나타내는 표현입니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%9D%B4%EC%8B%AC%EC%A0%84%EC%8B%AC", verification: "사전 확인"
        },
        {
            id: "yeokjisaji", word: "역지사지", hanja: "易地思之", theme: "관계",
            meaning: "처지를 바꾸어 상대방의 입장에서 생각함.",
            story: "서로의 자리를 바꾸어 생각해 본다는 뜻입니다. 자신의 기준만 고집하지 않고 상대가 놓인 상황과 마음을 헤아릴 때 갈등을 더 잘 풀 수 있습니다.",
            lesson: "의견이 다를 때 먼저 상대방의 자리에서 상황을 바라보면 이해의 폭이 넓어집니다.",
            source: "일반 한자성어", sourceNote: "바꿀 역, 땅 지, 생각 사, 갈 지를 써서 입장을 바꾸어 생각한다는 뜻을 나타냅니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%97%AD%EC%A7%80%EC%82%AC%EC%A7%80", verification: "사전 확인"
        },
        {
            id: "jumagapyeon", word: "주마가편", hanja: "走馬加鞭", theme: "노력",
            meaning: "달리는 말에 채찍을 더한다는 뜻으로, 잘하는 사람을 더욱 힘쓰게 함.",
            story: "이미 힘차게 달리는 말에 박차를 가해 더 빠르게 나아가게 한다는 표현입니다. 일이 잘되고 있을 때 노력을 더해 성과를 높이는 상황을 비유합니다.",
            lesson: "잘하고 있을 때에도 자만하지 않고 한 번 더 힘쓰면 더 큰 성장을 이룰 수 있습니다.",
            source: "일반 한자성어", sourceNote: "달릴 주, 말 마, 더할 가, 채찍 편을 써서 좋은 흐름에 노력을 더한다는 뜻입니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%A3%BC%EB%A7%88%EA%B0%80%ED%8E%B8", verification: "사전 확인"
        },
        {
            id: "chiljeonpalgi", word: "칠전팔기", hanja: "七顚八起", theme: "노력",
            meaning: "일곱 번 넘어져도 여덟 번 일어난다는 뜻으로, 실패해도 굽히지 않음.",
            story: "여러 번 넘어져도 그보다 한 번 더 일어난다는 말입니다. 실패의 횟수보다 다시 시작하는 의지가 중요하다는 뜻을 전합니다.",
            lesson: "실패는 끝이 아니라 다음 시도를 위한 경험이므로 포기하지 않고 다시 도전해야 합니다.",
            source: "일반 한자성어", sourceNote: "외부 자료의 七戰八起가 아니라 표준적으로 쓰이는 七顚八起로 바로잡았습니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%B9%A0%EC%A0%84%ED%8C%94%EA%B8%B0", verification: "사전 확인"
        },
        {
            id: "jagsimsamil", word: "작심삼일", hanja: "作心三日", theme: "노력",
            meaning: "단단히 먹은 마음이 사흘을 가지 못함.",
            story: "굳게 결심한 일도 실천이 이어지지 않으면 며칠 만에 흐지부지되기 쉽습니다. 결심보다 꾸준한 행동이 중요하다는 뜻으로 쓰입니다.",
            lesson: "큰 결심보다 매일 반복할 수 있는 작은 습관을 만드는 것이 오래가는 힘이 됩니다.",
            source: "일반 한자성어", sourceNote: "결심이 오래 지속되지 않는 모습을 경계하는 뜻으로 널리 쓰입니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%9E%91%EC%8B%AC%EC%82%BC%EC%9D%BC", verification: "사전 확인"
        },
        {
            id: "jaeopjadeuk", word: "자업자득", hanja: "自業自得", theme: "지혜",
            meaning: "자기가 저지른 일의 결과를 자기가 받음.",
            story: "불교에서 사람의 행동인 업은 그에 맞는 결과를 낳는다고 설명합니다. 자신이 만든 원인이 결국 자신에게 돌아온다는 가르침이 일상적인 한자성어로 자리 잡았습니다.",
            lesson: "행동에는 결과가 따르므로 선택하기 전에 그 영향까지 생각해야 합니다.",
            source: "불교 경전의 업보 사상", sourceNote: "자신의 행위가 그에 맞는 결과를 가져온다는 불교의 가르침에서 비롯되었습니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%9E%90%EC%97%85%EC%9E%90%EB%93%9D", verification: "사전 확인"
        },
        {
            id: "dongsangimong", word: "동상이몽", hanja: "同床異夢", theme: "관계",
            meaning: "같은 처지에 있으면서도 서로 다른 생각이나 목적을 가짐.",
            story: "한 침상에서 함께 자면서도 서로 다른 꿈을 꾼다는 표현입니다. 겉으로는 함께 행동하지만 속마음과 목표는 다른 관계를 비유합니다.",
            lesson: "함께 일할 때는 겉모습만 맞추지 말고 서로의 목표와 생각을 확인해야 합니다.",
            source: "중국 고전에서 유래한 한자성어", sourceNote: "같은 자리에 있어도 뜻은 서로 다를 수 있음을 잠자리와 꿈에 빗댄 표현입니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EB%8F%99%EC%83%81%EC%9D%B4%EB%AA%BD", verification: "사전 확인"
        },
        {
            id: "gyeoljahaeji", word: "결자해지", hanja: "結者解之", theme: "관계",
            meaning: "일을 맺은 사람이 그 일을 풀고 해결해야 함.",
            story: "매듭을 묶은 사람이 그 매듭을 풀어야 한다는 말입니다. 문제를 만든 사람이 책임지고 해결해야 한다는 뜻으로 널리 쓰입니다.",
            lesson: "자신이 만든 문제를 피하지 않고 끝까지 책임지는 태도가 신뢰를 만듭니다.",
            source: "한국에서 널리 쓰이는 한자성어", sourceNote: "맺을 결, 놈 자, 풀 해, 갈 지를 써서 문제를 만든 주체의 책임을 강조합니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EA%B2%B0%EC%9E%90%ED%95%B4%EC%A7%80", verification: "사전 확인"
        },
        {
            id: "ilseogijo", word: "일석이조", hanja: "一石二鳥", theme: "지혜",
            meaning: "한 가지 일을 하여 두 가지 이익을 얻음.",
            story: "돌 하나로 새 두 마리를 잡는다는 말에서 나온 표현입니다. 한 번의 행동으로 두 가지 성과를 함께 얻는 상황을 비유합니다.",
            lesson: "목표를 세울 때 서로 연결되는 일을 함께 살피면 시간과 노력을 더 효과적으로 쓸 수 있습니다.",
            source: "일반 한자성어", sourceNote: "두 가지 이득을 한 번에 얻는다는 뜻으로 널리 쓰이는 사자성어입니다.",
            reference: "https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%9D%BC%EC%84%9D%EC%9D%B4%EC%A1%B0", verification: "사전 확인"
        }
        ,
        { id:"samilcheonha", word:"삼일천하", hanja:"三日天下", theme:"역사", meaning:"아주 짧은 기간 동안 권세를 잡았다가 곧 잃음.", story:"사흘 동안 천하를 다스린다는 뜻으로 권세나 형편이 오래가지 못하는 상황을 비유합니다.", lesson:"눈앞의 성공에 자만하지 말고 오래 지속할 바탕을 마련해야 합니다.", source:"일반 한자 성어", sourceNote:"석 삼, 날 일, 하늘 천, 아래 하를 써서 매우 짧게 누린 권세를 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%82%BC%EC%9D%BC%EC%B2%9C%ED%95%98", verification:"사전 확인" },
        { id:"dongsimhyeomnyeok", word:"동심협력", hanja:"同心協力", theme:"관계", meaning:"같은 마음으로 서로 힘을 합쳐 협력함.", story:"여러 사람이 한마음이 되어 각자의 힘을 보태면 혼자 하기 어려운 일도 이룰 수 있다는 뜻입니다.", lesson:"공동 목표를 분명히 하고 서로의 역할을 존중하며 힘을 모아야 합니다.", source:"일반 한자 성어", sourceNote:"한가지 동, 마음 심, 도울 협, 힘 력을 써서 마음과 힘을 함께 모음을 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EB%8F%99%EC%8B%AC%ED%98%91%EB%A0%A5", verification:"사전 확인" },
        { id:"sanjeonsujeon", word:"산전수전", hanja:"山戰水戰", theme:"인내", meaning:"세상의 온갖 고생과 어려움을 다 겪음.", story:"산에서도 싸우고 물에서도 싸웠다는 말처럼 여러 어려움과 경험을 두루 겪은 사람을 가리킵니다.", lesson:"힘든 경험도 잘 돌아보면 다음 문제를 해결하는 지혜가 됩니다.", source:"일반 한자 성어", sourceNote:"메 산, 싸울 전, 물 수, 싸울 전을 써서 온갖 어려움을 겪었음을 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%82%B0%EC%A0%84%EC%88%98%EC%A0%84", verification:"사전 확인" },
        { id:"cheonbangjichuk", word:"천방지축", hanja:"天方地軸", theme:"지혜", meaning:"방향 없이 함부로 덤벙거리거나 몹시 부산하게 행동함.", story:"하늘의 방향과 땅의 축조차 가리지 못하듯 갈피를 잡지 못하고 움직이는 모습을 나타냅니다.", lesson:"서두를수록 먼저 주변을 살피고 일의 순서를 정해야 합니다.", source:"일반 한자 성어", sourceNote:"하늘 천, 모 방, 땅 지, 굴대 축을 써서 방향 없이 부산한 모습을 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%B2%9C%EB%B0%A9%EC%A7%80%EC%B6%95", verification:"사전 확인" },
        { id:"yumyeongmusil", word:"유명무실", hanja:"有名無實", theme:"지혜", meaning:"이름만 그럴듯하고 실제 내용이나 실속은 없음.", story:"겉으로 내세우는 이름과 명성은 훌륭하지만 그에 걸맞은 실제 내용이 없는 상태를 가리킵니다.", lesson:"이름이나 겉모습보다 실제 역할과 성과를 살펴야 합니다.", source:"일반 한자 성어", sourceNote:"있을 유, 이름 명, 없을 무, 열매 실을 써서 이름은 있으나 실속은 없음을 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%9C%A0%EB%AA%85%EB%AC%B4%EC%8B%A4", verification:"사전 확인" },
        { id:"munjeonseongsi", word:"문전성시", hanja:"門前成市", theme:"관계", meaning:"문 앞이 시장을 이룬 듯 찾아오는 사람이 매우 많아 붐빔.", story:"권세가 있거나 이름난 사람의 집 문 앞에 사람들이 몰려 시장처럼 붐비는 모습을 나타냅니다.", lesson:"사람이 많이 모이는 까닭과 관계의 바탕을 살펴야 합니다.", source:"일반 한자 성어", sourceNote:"문 문, 앞 전, 이룰 성, 시장 시를 써서 문 앞이 시장처럼 붐빔을 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EB%AC%B8%EC%A0%84%EC%84%B1%EC%8B%9C", verification:"사전 확인" },
        { id:"taksanggongnon", word:"탁상공론", hanja:"卓上空論", theme:"지혜", meaning:"현실성이 없는 이론이나 실제에 도움이 되지 않는 논의.", story:"책상 위에서 말로만 계획을 세우고 실제 현장의 사정은 살피지 않는 모습을 가리킵니다.", lesson:"좋은 생각도 현실에서 직접 시험하고 고쳐 나가야 쓸모가 있습니다.", source:"일반 한자 성어", sourceNote:"높을 탁, 위 상, 빌 공, 논할 론을 써서 책상 위의 헛된 논의를 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%ED%83%81%EC%83%81%EA%B3%B5%EB%A1%A0", verification:"사전 확인" },
        { id:"jaseungjabak", word:"자승자박", hanja:"自繩自縛", theme:"지혜", meaning:"자기가 한 말이나 행동 때문에 자신이 얽매이거나 곤란해짐.", story:"자신이 만든 줄로 스스로를 묶듯 자기 행동이 되돌아와 자신을 구속하는 상황을 비유합니다.", lesson:"말하고 행동하기 전에 결과와 책임을 생각해야 합니다.", source:"일반 한자 성어", sourceNote:"스스로 자, 줄 승, 스스로 자, 묶을 박을 써서 자신의 행동에 얽매임을 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%9E%90%EC%8A%B9%EC%9E%90%EB%B0%95", verification:"사전 확인" },
        { id:"myeonggyeongjisu", word:"명경지수", hanja:"明鏡止水", theme:"지혜", meaning:"맑은 거울과 고요한 물처럼 깨끗하고 평온한 마음.", story:"고요히 멈춘 물에 자신을 비추어 본다는 《장자》의 비유와 맑은 거울의 이미지가 합쳐진 표현입니다.", lesson:"마음을 차분히 가라앉히면 상황과 자신을 더 또렷하게 볼 수 있습니다.", source:"《장자》 〈덕충부〉의 비유와 관련", sourceNote:"밝을 명, 거울 경, 그칠 지, 물 수를 써서 맑고 고요한 마음을 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EB%AA%85%EA%B2%BD%EC%A7%80%EC%88%98", verification:"고전·사전 확인" },
        { id:"ingwaeungbo", word:"인과응보", hanja:"因果應報", theme:"지혜", meaning:"행한 일의 원인에 따라 알맞은 결과가 돌아옴.", story:"불교의 인과와 업보 사상에서 비롯되어 행동은 그에 맞는 결과를 낳는다는 뜻입니다.", lesson:"모든 선택에는 결과가 따르므로 이후의 영향까지 생각해야 합니다.", source:"불교 경전의 인과·업보 사상", sourceNote:"인할 인, 열매 과, 응할 응, 갚을 보를 써서 원인에 맞는 결과가 돌아옴을 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%9D%B8%EA%B3%BC%EC%9D%91%EB%B3%B4", verification:"사전 확인" },
        { id:"dongseonambuk", word:"동서남북", hanja:"東西南北", theme:"지혜", meaning:"동쪽·서쪽·남쪽·북쪽을 아울러 이르는 말로 모든 방향이나 여러 곳을 뜻함.", story:"네 방향을 함께 일컬으며 사방과 온 세상을 나타내는 표현입니다.", lesson:"한 방향만 보지 않고 여러 관점과 가능성을 두루 살펴야 합니다.", source:"일반 한자 성어", sourceNote:"동녘 동, 서녘 서, 남녘 남, 북녘 북을 써서 사방을 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EB%8F%99%EC%84%9C%EB%82%A8%EB%B6%81", verification:"사전 확인" },
        { id:"dongmunseodap", word:"동문서답", hanja:"東問西答", theme:"관계", meaning:"묻는 말과 전혀 상관없는 엉뚱한 대답을 함.", story:"동쪽을 물었는데 서쪽을 대답한다는 뜻으로 질문과 답의 요점이 어긋난 상황을 나타냅니다.", lesson:"상대의 말을 정확히 듣고 질문의 핵심에 맞게 대답해야 합니다.", source:"일반 한자 성어", sourceNote:"동녘 동, 물을 문, 서녘 서, 대답 답을 써서 질문과 답이 어긋남을 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EB%8F%99%EB%AC%B8%EC%84%9C%EB%8B%B5", verification:"사전 확인" },
        { id:"iyeolchyeol", word:"이열치열", hanja:"以熱治熱", theme:"지혜", meaning:"열은 열로써 다스린다는 뜻으로 같은 성질의 방법으로 어려움을 이겨 냄.", story:"더운 날 뜨거운 음식을 먹어 땀을 내고 더위를 이기듯 같은 성질의 방법으로 문제를 다스리는 모습입니다.", lesson:"상황에 따라 같은 원리로 정면 대응하는 방법이 효과적일 수 있습니다.", source:"일반 한자 성어", sourceNote:"써 이, 더울 열, 다스릴 치, 더울 열을 써서 열로 열을 다스림을 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%9D%B4%EC%97%B4%EC%B9%98%EC%97%B4", verification:"사전 확인" },
        { id:"gyeonmulsaengsim", word:"견물생심", hanja:"見物生心", theme:"지혜", meaning:"물건을 보면 그것을 가지고 싶은 욕심이 생김.", story:"마음에 없던 욕심도 좋은 물건을 직접 보고 나면 생길 수 있다는 심리를 나타냅니다.", lesson:"눈앞의 유혹에 따르기 전에 정말 필요한 것인지 생각해야 합니다.", source:"일반 한자 성어", sourceNote:"볼 견, 물건 물, 날 생, 마음 심을 써서 물건을 보고 욕심이 생김을 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EA%B2%AC%EB%AC%BC%EC%83%9D%EC%8B%AC", verification:"사전 확인" },
        { id:"iljangildan", word:"일장일단", hanja:"一長一短", theme:"지혜", meaning:"한편으로는 장점이 있고 다른 한편으로는 단점이 있음.", story:"하나는 길고 하나는 짧다는 말에서 무엇에나 좋은 점과 부족한 점이 함께 있음을 나타냅니다.", lesson:"장단점을 함께 비교하여 상황에 맞게 선택해야 합니다.", source:"일반 한자 성어", sourceNote:"한 일, 길 장, 한 일, 짧을 단을 써서 장점과 단점이 함께 있음을 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%9D%BC%EC%9E%A5%EC%9D%BC%EB%8B%A8", verification:"사전 확인" },
        { id:"sipinsipsaek", word:"십인십색", hanja:"十人十色", theme:"관계", meaning:"사람마다 생각과 성격, 취향이 모두 다름.", story:"열 사람이 있으면 열 가지 빛깔이 있다는 뜻으로 사람마다 다른 개성과 관점을 지님을 비유합니다.", lesson:"나와 다른 생각을 틀렸다고 여기지 않고 각자의 차이를 존중해야 합니다.", source:"일반 한자 성어", sourceNote:"열 십, 사람 인, 열 십, 빛 색을 써서 사람마다 특색이 다름을 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%8B%AD%EC%9D%B8%EC%8B%AD%EC%83%89", verification:"사전 확인" },
        { id:"seongyeonjimyeong", word:"선견지명", hanja:"先見之明", theme:"지혜", meaning:"앞으로 일어날 일을 미리 내다보는 밝은 지혜.", story:"다른 사람보다 먼저 변화를 알아보고 앞날을 준비하는 통찰력을 밝은 눈에 빗댄 표현입니다.", lesson:"작은 징후를 관찰하고 경험과 지식을 바탕으로 미리 준비해야 합니다.", source:"일반 한자 성어", sourceNote:"먼저 선, 볼 견, 갈 지, 밝을 명을 써서 앞일을 미리 보는 지혜를 나타냅니다.", reference:"https://stdict.korean.go.kr/search/searchResult.do?pageNo=1&searchKeyword=%EC%84%A0%EA%B2%AC%EC%A7%80%EB%AA%85", verification:"사전 확인" }
    ];

    const excludedIds = new Set([
        "sujudaeto", "wanbyeokgwijo", "mungyeongjigyo",
        "iljacheongeum", "nakyangjiga", "baegajeolhyeon", "namgailmong",
        "mangyangboro", "nomajiji", "gyemyeonggudo", "sunmangchihan",
        "baejungsayeong", "chomokgaebyeong"
    ]);

    const intermediateIds = new Set([
        "ugongisan", "hogahowi", "jirokwima", "bulchihamun", "maengmosamcheon",
        "gyeolchooseun", "pajukjise", "dongbyeongsangryeon", "gwontojungrae", "gyereuk",
        "isimjeonsim", "jumagapyeon", "suguchosim", "cheonjaeilu", "gogunbuntu",
        "cheonsinmango", "samsaileon", "geungeomjeoryak"
    ]);

    const advancedIds = new Set([
        "tosagupaeng", "sueojigyo", "jeolchatakma", "gwanpojigyo", "hyeongseoljigong",
        "yeonmokgueo", "mosujacheon", "nangjungjichu", "owoldongju", "yangsanggunja"
    ]);

    return entries.filter((entry) => !excludedIds.has(entry.id)).map((entry) => ({
        ...entry,
        level: advancedIds.has(entry.id) ? "고급" : (intermediateIds.has(entry.id) ? "중급" : "초급")
    }));
});
