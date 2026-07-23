(() => {
    "use strict";

    const fileName = location.pathname.split("/").pop() || "";
    const system = fileName.replace(".html", "");
    const supported = ["digestion", "respiration", "nervous", "immune", "movement", "excretion", "temperature"];
    if (!supported.includes(system)) return;

    document.body.classList.add("series-premium");
    document.body.dataset.bodySystem = system;

    const galleryRoom = document.createElement("div");
    galleryRoom.className = "anatomy-gallery-room";
    galleryRoom.setAttribute("aria-hidden", "true");
    galleryRoom.innerHTML = `
        <div class="gallery-ceiling"><i></i><i></i><i></i></div>
        <div class="gallery-back-wall"><span></span></div>
        <div class="gallery-side-wall gallery-side-left">
            <i class="gallery-frame frame-one"><b></b></i>
            <i class="gallery-frame frame-two"><b></b></i>
            <i class="gallery-frame frame-three"><b></b></i>
        </div>
        <div class="gallery-side-wall gallery-side-right">
            <i class="gallery-frame frame-one"><b></b></i>
            <i class="gallery-frame frame-two"><b></b></i>
            <i class="gallery-frame frame-three"><b></b></i>
        </div>
        <div class="gallery-floor"><i></i></div>
        <div class="gallery-room-vignette"></div>`;
    document.body.prepend(galleryRoom);

    const atlasSystems = ["digestion", "respiration", "nervous", "immune", "movement", "excretion", "temperature"];
    if (!atlasSystems.includes(system)) return;
    document.body.classList.add("has-system-atlas");

    const scenePanel = document.getElementById("scenePanel");
    if (!scenePanel) return;

    const atlas = document.createElement("div");
    atlas.className = "system-process-atlas";
    atlas.setAttribute("role", "region");
    const systemNames = {
        digestion: "소화기관",
        respiration: "호흡기관",
        nervous: "신경계",
        immune: "면역계",
        movement: "뼈와 근육",
        excretion: "배설기관",
        temperature: "체온 조절계"
    };
    atlas.setAttribute("aria-label", `3D ${systemNames[system]} 자유 탐험`);
    scenePanel.append(atlas);

    const digestionSvg = `
        <svg viewBox="0 0 300 315">
            <path class="atlas-route" d="M148 48 C146 83 146 104 153 119 C171 145 165 164 151 180 C124 202 105 235 111 280"/>
            <path class="atlas-flow" d="M148 49 C146 83 146 104 153 119 C171 145 165 164 151 180 C124 202 105 235 111 280"/>
            <g class="atlas-organ" data-part="mouth"><path d="M121 53 Q149 31 178 53 Q151 73 121 53" fill="#f18b79" stroke="#ffd0b4" stroke-width="3"/><text class="atlas-label" x="184" y="57">입·침</text></g>
            <g class="atlas-organ" data-part="esophagus"><path d="M147 68 C142 91 145 113 154 132" fill="none" stroke="#d99a79" stroke-width="14" stroke-linecap="round"/><text class="atlas-label" x="171" y="103">식도</text></g>
            <g class="atlas-organ" data-part="stomach"><path d="M153 124 C192 119 205 149 185 177 C169 198 138 181 143 153 C146 139 151 133 153 124Z" fill="#ce5365" stroke="#ffb499" stroke-width="4"/><text class="atlas-label" x="199" y="158">위</text></g>
            <g class="atlas-organ" data-part="helpers"><path d="M107 132 Q140 109 174 123 Q163 147 123 151Z" fill="#a86b45" stroke="#eac089" stroke-width="3"/><path d="M189 178 Q209 171 214 188 Q199 196 184 188Z" fill="#efbd63"/><text class="atlas-label" x="73" y="125">간</text><text class="atlas-label" x="217" y="193">이자</text></g>
            <g class="atlas-organ" data-part="intestine"><path d="M130 187 C188 177 207 205 190 231 C174 251 126 224 139 207 C153 187 191 203 176 222 C163 239 129 237 125 258 C121 277 161 283 184 263" fill="none" stroke="#ed9b77" stroke-width="13" stroke-linecap="round"/><text class="atlas-label" x="195" y="242">작은창자</text></g>
            <g class="atlas-organ" data-part="absorption"><path d="M137 212 l7 -11 l7 12 l8 -12 l8 12 l8 -11" fill="none" stroke="#ffe3a5" stroke-width="4"/><circle cx="158" cy="217" r="31" fill="none" stroke="#72cfe0" stroke-width="3" stroke-dasharray="5 4"/><text class="atlas-label" x="185" y="204">융털·흡수</text></g>
            <g class="atlas-organ" data-part="large"><path d="M113 184 C91 194 88 252 99 280 M113 184 C142 174 183 178 202 194 M202 194 C211 221 207 259 191 282" fill="none" stroke="#b86c64" stroke-width="16" stroke-linecap="round"/><text class="atlas-label" x="204" y="271">큰창자</text></g>
            <circle cx="111" cy="284" r="7" fill="#ffd28b"/>
        </svg>`;

    const respirationSvg = `
        <svg viewBox="0 0 300 315">
            <path class="atlas-route" d="M147 43 C149 83 150 111 151 142 M151 142 L104 186 M151 142 L200 186"/>
            <path class="atlas-flow" d="M147 43 C149 83 150 111 151 142 M151 142 L104 186 M151 142 L200 186"/>
            <g class="atlas-organ" data-part="nose"><path d="M128 48 Q147 30 171 48 Q155 63 132 59Z" fill="#e8998f" stroke="#ffd0c0" stroke-width="3"/><path d="M147 52 C147 74 149 88 150 103" stroke="#80d8e5" stroke-width="8" fill="none"/><text class="atlas-label" x="179" y="52">코</text></g>
            <g class="atlas-organ" data-part="airway"><path d="M150 91 L151 153 M151 145 L106 186 M151 145 L197 186" fill="none" stroke="#83d9e4" stroke-width="13" stroke-linecap="round"/><text class="atlas-label" x="169" y="118">기관</text><text class="atlas-label" x="211" y="179">기관지</text></g>
            <g class="atlas-organ" data-part="lungs"><path d="M135 137 C95 127 63 165 67 232 C70 276 101 283 137 257Z" fill="#b84d67" stroke="#ff9c9e" stroke-width="4"/><path d="M167 137 C207 127 239 165 235 232 C232 276 201 283 165 257Z" fill="#b84d67" stroke="#ff9c9e" stroke-width="4"/><path d="M80 272 Q151 295 224 272" fill="none" stroke="#ffd08a" stroke-width="6"/><text class="atlas-label" x="102" y="296">가로막</text></g>
            <g class="atlas-organ" data-part="alveoli"><g transform="translate(208 219)" fill="#f7a6a7" stroke="#ffd2bd" stroke-width="3"><circle cx="0" cy="0" r="17"/><circle cx="22" cy="-11" r="15"/><circle cx="24" cy="15" r="16"/><circle cx="2" cy="24" r="16"/><circle cx="-19" cy="14" r="14"/></g><text class="atlas-label" x="228" y="250">폐포</text></g>
            <g class="atlas-organ" data-part="exchange"><path d="M176 208 C206 183 254 202 255 238 C256 271 216 284 188 263" fill="none" stroke="#64cbe0" stroke-width="5" stroke-dasharray="6 4"/><text class="atlas-label" x="178" y="188">O₂ → 혈액</text><text class="atlas-label" x="178" y="278">CO₂ → 폐포</text></g>
            <g class="atlas-organ" data-part="body"><path d="M72 257 C56 267 47 284 43 303 M230 258 C245 270 253 287 257 303" fill="none" stroke="#e95d68" stroke-width="5"/><text class="atlas-label" x="20" y="289">온몸</text></g>
        </svg>`;

    const nervousSvg = `
        <svg viewBox="0 0 300 315">
            <path class="atlas-route" d="M150 62 L150 212 M150 115 C105 145 82 185 59 241 M150 125 C196 153 220 190 244 239"/>
            <path class="atlas-flow" d="M150 62 L150 212 M150 115 C105 145 82 185 59 241 M150 125 C196 153 220 190 244 239"/>
            <g class="atlas-organ" data-part="brain"><path d="M118 59 C111 31 137 20 153 34 C169 17 195 35 188 58 C199 79 171 92 154 78 C137 94 105 80 118 59Z" fill="#f0bc63" stroke="#ffe4a3" stroke-width="3"/><path d="M130 43 Q146 55 132 72 M156 34 Q169 48 158 75 M181 42 Q165 55 181 68" fill="none" stroke="#9d6d36" stroke-width="2"/><text class="atlas-label" x="199" y="59">뇌</text></g>
            <g class="atlas-organ" data-part="spinal"><path d="M151 79 C147 120 153 162 150 215" fill="none" stroke="#f4d57e" stroke-width="13" stroke-linecap="round"/><path d="M150 101 L119 126 M150 126 L183 151 M150 155 L112 190" fill="none" stroke="#e7b95c" stroke-width="5"/><text class="atlas-label" x="164" y="177">척수</text></g>
            <g class="atlas-organ" data-part="sensory"><path d="M119 126 C91 151 72 184 58 236" fill="none" stroke="#62d1df" stroke-width="7"/><g fill="#8ce9f1"><circle cx="58" cy="236" r="10"/><circle cx="77" cy="201" r="5"/><circle cx="96" cy="164" r="5"/></g><text class="atlas-label" x="24" y="258">감각 신경</text></g>
            <g class="atlas-organ" data-part="motor"><path d="M181 151 C207 169 225 199 242 239" fill="none" stroke="#ed7a68" stroke-width="7"/><path d="M150 126 C188 135 218 161 244 199" fill="none" stroke="#ed7a68" stroke-width="4"/><text class="atlas-label" x="203" y="164">운동 신경</text></g>
            <g class="atlas-organ" data-part="muscle"><path d="M222 224 Q248 205 270 233 Q250 270 216 260Z" fill="#cf5c63" stroke="#ffaaa0" stroke-width="3"/><path d="M229 237 L259 237 M227 247 L254 250" stroke="#ffc0aa" stroke-width="2"/><text class="atlas-label" x="202" y="285">반응 근육</text></g>
        </svg>`;

    const immuneSvg = `
        <svg viewBox="0 0 300 315">
            <path class="atlas-route" d="M42 90 H258 M76 116 C112 153 167 161 225 132 M92 224 C143 193 198 205 240 250"/>
            <path class="atlas-flow" d="M42 90 H258 M76 116 C112 153 167 161 225 132 M92 224 C143 193 198 205 240 250"/>
            <g class="atlas-organ" data-part="barrier"><path d="M35 71 Q81 56 127 73 T218 71 T276 75 L275 111 Q228 97 181 112 T87 108 T35 112Z" fill="#d9866e" stroke="#ffc1a7" stroke-width="3"/><path d="M45 89 H266" stroke="#ffe0b8" stroke-width="3" stroke-dasharray="7 5"/><text class="atlas-label" x="40" y="54">피부 장벽</text></g>
            <g class="atlas-organ" data-part="whitecell"><circle cx="112" cy="162" r="38" fill="#79c36a" stroke="#d0f3a6" stroke-width="4"/><path d="M90 161 Q108 137 127 158 T105 184 T90 161" fill="#416c50"/><text class="atlas-label" x="69" y="211">백혈구</text></g>
            <g class="atlas-organ" data-part="antibody"><g fill="none" stroke="#f5d36b" stroke-width="7" stroke-linecap="round"><path d="M196 126 L213 145 L231 124 M213 145 L213 176"/><path d="M231 171 L247 187 L263 170 M247 187 L247 214"/></g><text class="atlas-label" x="181" y="112">항체</text></g>
            <g class="atlas-organ" data-part="memory"><circle cx="94" cy="254" r="27" fill="#62bdd1" stroke="#c8f4ef" stroke-width="4"/><path d="M82 253 Q94 238 106 253 Q94 270 82 253Z" fill="#286d86"/><text class="atlas-label" x="48" y="295">기억세포</text></g>
            <g class="atlas-organ" data-part="vaccine"><path d="M178 233 L227 282" stroke="#d8dce8" stroke-width="12" stroke-linecap="round"/><path d="M169 224 L188 243 M218 272 L236 290" stroke="#79d8e5" stroke-width="7"/><circle cx="161" cy="215" r="12" fill="#9edce0"/><text class="atlas-label" x="180" y="220">백신</text></g>
            <g fill="#e96f75"><circle cx="54" cy="137" r="8"/><circle cx="68" cy="157" r="6"/><circle cx="49" cy="177" r="7"/></g>
        </svg>`;

    const movementSvg = `
        <svg viewBox="0 0 300 315">
            <path class="atlas-route" d="M87 67 C123 104 145 145 151 178 C159 213 190 248 232 273"/>
            <path class="atlas-flow" d="M87 67 C123 104 145 145 151 178 C159 213 190 248 232 273"/>
            <g class="atlas-organ" data-part="joint"><circle cx="151" cy="172" r="31" fill="#e5ca88" stroke="#fff0bf" stroke-width="5"/><circle cx="151" cy="172" r="12" fill="#6fc8d7"/><text class="atlas-label" x="166" y="177">관절</text></g>
            <g class="atlas-organ" data-part="flexor"><path d="M75 70 C116 75 142 106 145 148 C116 151 89 123 75 70Z" fill="#df655e" stroke="#ffaca0" stroke-width="4"/><path d="M145 145 L151 164" stroke="#f2d7b5" stroke-width="7"/><text class="atlas-label" x="48" y="60">굽힘근</text></g>
            <g class="atlas-organ" data-part="extensor"><path d="M96 61 C139 66 163 102 161 147 C143 137 125 101 96 61Z" fill="#ad4b61" stroke="#ef8e91" stroke-width="4"/><path d="M160 143 L156 163" stroke="#f2d7b5" stroke-width="7"/><text class="atlas-label" x="128" y="50">폄근</text></g>
            <g class="atlas-organ" data-part="tendon"><path d="M156 194 C174 222 194 245 220 264" fill="none" stroke="#f1ddb0" stroke-width="10"/><text class="atlas-label" x="170" y="228">힘줄</text></g>
            <g class="atlas-organ" data-part="bone"><path d="M84 74 L143 157 M160 190 L226 265" stroke="#f3d791" stroke-width="16" stroke-linecap="round"/><circle cx="82" cy="70" r="13" fill="#f3d791"/><circle cx="230" cy="270" r="15" fill="#f3d791"/><text class="atlas-label" x="47" y="110">뼈</text></g>
            <g class="atlas-organ" data-part="load"><path d="M210 269 H265 L257 302 H219Z" fill="#75869a" stroke="#cbd5df" stroke-width="3"/><path d="M228 269 V248 H248 V269" fill="none" stroke="#cbd5df" stroke-width="6"/><text class="atlas-label" x="205" y="315">하중</text></g>
        </svg>`;

    const excretionSvg = `
        <svg viewBox="0 0 300 315">
            <path class="atlas-route" d="M90 104 C98 158 117 206 146 252 M210 104 C202 158 183 206 154 252"/>
            <path class="atlas-flow" d="M90 104 C98 158 117 206 146 252 M210 104 C202 158 183 206 154 252"/>
            <g class="atlas-organ" data-part="kidney"><path d="M68 74 C37 90 47 153 84 158 C116 160 124 118 110 88 C101 68 84 66 68 74Z" fill="#b84e66" stroke="#ff9f9f" stroke-width="4"/><path d="M232 74 C263 90 253 153 216 158 C184 160 176 118 190 88 C199 68 216 66 232 74Z" fill="#b84e66" stroke="#ff9f9f" stroke-width="4"/><text class="atlas-label" x="51" y="61">콩팥</text></g>
            <g class="atlas-organ" data-part="nephron"><path d="M79 95 C107 80 120 110 101 128 C84 145 56 127 70 111 C87 91 116 135 92 153" fill="none" stroke="#f2d273" stroke-width="5"/><circle cx="78" cy="99" r="12" fill="none" stroke="#8adcea" stroke-width="4"/><text class="atlas-label" x="33" y="180">네프론</text></g>
            <g class="atlas-organ" data-part="ureter"><path d="M92 151 C100 197 118 225 143 251 M208 151 C200 197 182 225 157 251" fill="none" stroke="#e8c17f" stroke-width="8"/><text class="atlas-label" x="192" y="211">요관</text></g>
            <g class="atlas-organ" data-part="bladder"><path d="M119 250 Q150 230 181 250 Q190 286 150 299 Q110 286 119 250Z" fill="#d89b69" stroke="#ffd0a0" stroke-width="4"/><text class="atlas-label" x="188" y="281">방광</text></g>
            <g class="atlas-organ" data-part="balance"><path d="M149 56 C131 83 134 98 150 104 C167 97 168 80 149 56Z" fill="#64c8e0" stroke="#b9f3f4" stroke-width="3"/><path d="M132 117 H168" stroke="#ef6d73" stroke-width="7"/><text class="atlas-label" x="171" y="61">수분·염류</text></g>
        </svg>`;

    const temperatureSvg = `
        <svg viewBox="0 0 300 315">
            <path class="atlas-route" d="M150 60 L150 232 M150 113 C107 135 81 180 66 245 M150 113 C193 135 219 180 234 245"/>
            <path class="atlas-flow" d="M150 60 L150 232 M150 113 C107 135 81 180 66 245 M150 113 C193 135 219 180 234 245"/>
            <g class="atlas-organ" data-part="hypothalamus"><path d="M116 54 C111 26 139 19 153 34 C173 18 195 40 185 62 C172 83 126 82 116 54Z" fill="#e9bb5b" stroke="#ffe5a0" stroke-width="4"/><circle cx="151" cy="57" r="9" fill="#ee6f5b"/><text class="atlas-label" x="190" y="54">시상하부</text></g>
            <g class="atlas-organ" data-part="vessels"><path d="M48 128 H252 V177 H48Z" fill="#d58b72" stroke="#ffc3a5" stroke-width="3"/><path d="M59 151 C90 133 117 170 148 151 S207 134 241 151" fill="none" stroke="#e85261" stroke-width="8"/><text class="atlas-label" x="54" y="119">피부 혈관</text></g>
            <g class="atlas-organ" data-part="sweat"><path d="M91 176 C64 188 71 222 94 215 C114 208 105 185 91 191 C77 199 91 229 89 249" fill="none" stroke="#73cfe0" stroke-width="7"/><path d="M88 247 C76 266 79 278 90 282 C102 276 102 262 88 247Z" fill="#7de0e8"/><text class="atlas-label" x="34" y="298">땀샘</text></g>
            <g class="atlas-organ" data-part="muscle"><path d="M171 190 Q213 174 240 212 Q218 260 169 244Z" fill="#c9545d" stroke="#ff9b91" stroke-width="4"/><path d="M180 207 L229 204 M177 221 L228 223 M179 235 L218 241" stroke="#ffc0ac" stroke-width="3"/><text class="atlas-label" x="186" y="274">골격근</text></g>
            <g class="atlas-organ" data-part="core"><circle cx="150" cy="206" r="31" fill="rgba(240,96,74,.28)" stroke="#f47a5d" stroke-width="4"/><circle cx="150" cy="206" r="13" fill="#ff6b4e"/><text class="atlas-label" x="116" y="250">중심 체온</text></g>
        </svg>`;

    const svgBySystem = { digestion: digestionSvg, respiration: respirationSvg, nervous: nervousSvg, immune: immuneSvg, movement: movementSvg, excretion: excretionSvg, temperature: temperatureSvg };
    const atlasTitles = {
        digestion: "DIGESTIVE TRACT · LIVE",
        respiration: "RESPIRATORY TRACT · LIVE",
        nervous: "NERVOUS SYSTEM · LIVE",
        immune: "IMMUNE DEFENSE · LIVE",
        movement: "MUSCULOSKELETAL · LIVE",
        excretion: "URINARY SYSTEM · LIVE",
        temperature: "THERMOREGULATION · LIVE"
    };
    atlas.innerHTML = svgBySystem[system];
    atlas.dataset.title = atlasTitles[system];
    atlas.insertAdjacentHTML("afterbegin", `
        <div class="system-atlas-toolbar" aria-label="3D 기관 지도 조작">
            <button type="button" data-system-atlas="explore" aria-pressed="false"><i></i>자유 탐험</button>
            <button type="button" data-system-atlas="zoom-out" aria-label="기관 지도 축소">−</button>
            <button type="button" data-system-atlas="reset" aria-label="기관 지도 3D 초기화">3D</button>
            <button type="button" data-system-atlas="zoom-in" aria-label="기관 지도 확대">＋</button>
        </div>
        <div class="system-atlas-inspector" aria-live="polite">
            <span>FREE ANATOMY</span>
            <strong>기관을 선택하세요</strong>
            <p>빛나는 기관을 누르면 구조와 기능을 자세히 볼 수 있습니다.</p>
        </div>
    `);

    const systemNotes = {
        digestion: {
            mouth: ["입과 침샘", "이는 음식을 잘게 부수고 침은 음식과 섞여 녹말의 소화를 시작합니다."],
            esophagus: ["식도", "근육의 연동운동이 음식 덩어리를 중력과 관계없이 위까지 밀어냅니다."],
            stomach: ["위", "두꺼운 근육이 음식과 위액을 섞고 단백질 소화를 시작해 죽처럼 만듭니다."],
            helpers: ["간과 이자", "간의 담즙과 이자의 소화효소가 작은창자에서 지방·탄수화물·단백질의 소화를 돕습니다."],
            intestine: ["작은창자", "길고 구불구불한 관에서 소화가 마무리되며 대부분의 영양소가 흡수됩니다."],
            absorption: ["융털과 모세혈관", "작은창자 안쪽의 수많은 융털이 표면적을 넓혀 영양소를 혈액으로 전달합니다."],
            large: ["큰창자", "소화되고 남은 물질에서 물을 흡수하고 몸 밖으로 내보낼 찌꺼기를 만듭니다."]
        },
        respiration: {
            nose: ["코와 비강", "들어온 공기의 먼지를 거르고 따뜻하고 촉촉하게 만들어 기관으로 보냅니다."],
            airway: ["기관과 기관지", "기관은 가슴으로 내려가 좌우 기관지로 갈라지고 각 폐 속으로 공기를 전달합니다."],
            lungs: ["폐와 가로막", "가로막이 내려가면 흉강이 넓어져 폐가 부풀고 공기가 들어옵니다."],
            alveoli: ["폐포", "얇은 벽을 가진 작은 공기주머니로, 넓은 표면에서 빠른 기체교환이 일어납니다."],
            exchange: ["폐포 모세혈관", "산소는 폐포에서 혈액으로, 이산화탄소는 혈액에서 폐포로 확산됩니다."],
            body: ["온몸의 세포", "혈액이 산소를 세포에 전달하고 세포에서 나온 이산화탄소를 다시 폐로 운반합니다."]
        },
        nervous: {
            brain: ["뇌", "감각 정보를 해석하고 판단한 뒤 몸이 어떻게 반응할지 명령을 만듭니다."],
            spinal: ["척수", "뇌와 온몸 사이에서 신호를 전달하며 빠른 반사 작용의 중심이 되기도 합니다."],
            sensory: ["감각 신경", "피부와 감각기관에서 받은 자극을 전기 신호로 바꾸어 중추로 보냅니다."],
            motor: ["운동 신경", "뇌와 척수의 명령을 근육과 기관으로 전달합니다."],
            muscle: ["반응 근육", "운동 신경의 신호를 받으면 수축하거나 이완하여 실제 움직임을 만듭니다."]
        },
        immune: {
            barrier: ["피부 장벽", "병원체가 몸 안으로 들어오지 못하게 막는 가장 바깥쪽의 1차 방어선입니다."],
            whitecell: ["백혈구", "몸속을 돌아다니며 침입자를 찾고 먹어 없애거나 다른 면역세포를 활성화합니다."],
            antibody: ["항체", "특정 병원체의 표면에 정확히 결합하여 활동을 막고 제거 표지로 작용합니다."],
            memory: ["기억세포", "한번 만난 병원체의 특징을 기억해 다음 침입 때 더 빠르고 강하게 반응합니다."],
            vaccine: ["백신", "질병을 일으키지 않는 안전한 정보로 면역계가 미리 기억세포를 만들도록 돕습니다."]
        },
        movement: {
            joint: ["관절", "뼈와 뼈가 만나는 곳으로 움직임의 축이 되고 연골이 충격과 마찰을 줄입니다."],
            flexor: ["굽힘근", "수축할 때 관절의 각도를 줄여 팔이나 다리를 굽히는 근육입니다."],
            extensor: ["폄근", "굽힘근과 반대로 수축하여 관절을 펴며 두 근육은 서로 번갈아 작용합니다."],
            tendon: ["힘줄", "근육의 수축력을 뼈에 전달하는 질긴 결합조직입니다."],
            bone: ["뼈", "몸의 형태를 지지하고 장기를 보호하며 근육이 힘을 전달할 지렛대가 됩니다."],
            load: ["하중", "물체의 무게와 관절에서의 거리에 따라 근육이 내야 하는 힘이 달라집니다."]
        },
        excretion: {
            kidney: ["콩팥", "혈액을 거르고 필요한 물질은 되찾으며 노폐물과 남는 물로 오줌을 만듭니다."],
            nephron: ["네프론", "콩팥 속의 매우 작은 여과 단위로 여과·재흡수·분비가 이어집니다."],
            ureter: ["요관", "콩팥에서 만들어진 오줌을 근육운동으로 방광까지 운반합니다."],
            bladder: ["방광", "오줌을 일정 시간 저장했다가 몸 밖으로 배출합니다."],
            balance: ["수분과 염류 균형", "콩팥은 몸 상태에 맞춰 되찾는 물과 염류의 양을 조절해 내부 환경을 일정하게 합니다."]
        },
        temperature: {
            hypothalamus: ["시상하부", "혈액의 온도를 감지하고 땀·피부 혈관·근육에 체온 조절 명령을 보냅니다."],
            vessels: ["피부 혈관", "더울 때 넓어져 열을 내보내고 추울 때 좁아져 몸속의 열을 보존합니다."],
            sweat: ["땀샘", "땀이 피부에서 증발할 때 열을 빼앗아 몸을 식힙니다."],
            muscle: ["골격근", "추울 때 빠르게 수축하는 떨림 운동으로 열을 만들어냅니다."],
            core: ["중심 체온", "여러 조절 반응이 함께 작동해 중요한 장기의 온도를 좁은 범위로 유지합니다."]
        }
    };
    const systemAtlasState = { x: -2, y: 0, zoom: 1, dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 };
    const systemAtlasInspector = atlas.querySelector(".system-atlas-inspector");
    const systemExploreButton = atlas.querySelector("[data-system-atlas='explore']");

    function applySystemAtlasCamera() {
        atlas.style.setProperty("--system-rotate-x", `${systemAtlasState.x}deg`);
        atlas.style.setProperty("--system-rotate-y", `${systemAtlasState.y}deg`);
        atlas.style.setProperty("--system-atlas-scale", systemAtlasState.zoom.toFixed(2));
        atlas.style.setProperty("--system-shadow-x", `${systemAtlasState.y * -.45}px`);
        atlas.dataset.cameraMoved = String(Math.abs(systemAtlasState.y) > 2 || Math.abs(systemAtlasState.x + 2) > 2 || Math.abs(systemAtlasState.zoom - 1) > .02);
    }

    function resetSystemAtlas() {
        systemAtlasState.x = -2;
        systemAtlasState.y = 0;
        systemAtlasState.zoom = 1;
        applySystemAtlasCamera();
    }

    function setSystemFreeExplore(active) {
        atlas.classList.toggle("is-free-explore", active);
        scenePanel.classList.toggle("system-free-explore-active", active);
        systemExploreButton.setAttribute("aria-pressed", String(active));
        atlas.querySelectorAll(".atlas-organ").forEach((part) => {
            part.setAttribute("tabindex", active ? "0" : "-1");
            part.classList.remove("is-inspected");
        });
        if (active) {
            systemAtlasInspector.querySelector("strong").textContent = `${systemNames[system]}을 선택하세요`;
            systemAtlasInspector.querySelector("p").textContent = "모델을 회전하거나 확대하고, 빛나는 구조를 눌러 기능을 확인하세요.";
        }
        const announcer = document.getElementById("announcer");
        if (announcer) {
            announcer.textContent = active
                ? `${systemNames[system]} 자유 탐험을 시작했습니다.`
                : "학습 단계 보기로 돌아왔습니다.";
        }
    }

    atlas.querySelectorAll(".atlas-organ").forEach((part) => {
        const note = systemNotes[system][part.dataset.part];
        part.setAttribute("role", "button");
        part.setAttribute("tabindex", "-1");
        part.setAttribute("aria-label", `${note[0]} 기능 보기`);
        const inspect = () => {
            if (!atlas.classList.contains("is-free-explore")) return;
            atlas.querySelectorAll(".atlas-organ").forEach((item) => item.classList.toggle("is-inspected", item === part));
            systemAtlasInspector.querySelector("strong").textContent = note[0];
            systemAtlasInspector.querySelector("p").textContent = note[1];
            const announcer = document.getElementById("announcer");
            if (announcer) announcer.textContent = `${note[0]}. ${note[1]}`;
        };
        part.addEventListener("click", inspect);
        part.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                inspect();
            }
        });
    });

    atlas.querySelector(".system-atlas-toolbar").addEventListener("click", (event) => {
        const button = event.target.closest("[data-system-atlas]");
        if (!button) return;
        const action = button.dataset.systemAtlas;
        if (action === "explore") {
            setSystemFreeExplore(!atlas.classList.contains("is-free-explore"));
            return;
        }
        if (action === "reset") {
            resetSystemAtlas();
            return;
        }
        systemAtlasState.zoom = Math.max(.82, Math.min(1.3, systemAtlasState.zoom + (action === "zoom-in" ? .08 : -.08)));
        applySystemAtlasCamera();
    });

    atlas.addEventListener("pointerdown", (event) => {
        if (event.target.closest("button, .atlas-organ, .system-atlas-inspector")) return;
        systemAtlasState.dragging = true;
        systemAtlasState.startX = event.clientX;
        systemAtlasState.startY = event.clientY;
        systemAtlasState.originX = systemAtlasState.x;
        systemAtlasState.originY = systemAtlasState.y;
        atlas.classList.add("is-rotating");
        atlas.setPointerCapture?.(event.pointerId);
    });

    atlas.addEventListener("pointermove", (event) => {
        if (!systemAtlasState.dragging) return;
        systemAtlasState.y = Math.max(-28, Math.min(28, systemAtlasState.originY + (event.clientX - systemAtlasState.startX) * .18));
        systemAtlasState.x = Math.max(-14, Math.min(12, systemAtlasState.originX - (event.clientY - systemAtlasState.startY) * .12));
        applySystemAtlasCamera();
    });

    const stopSystemRotation = (event) => {
        if (!systemAtlasState.dragging) return;
        systemAtlasState.dragging = false;
        atlas.classList.remove("is-rotating");
        atlas.releasePointerCapture?.(event.pointerId);
    };
    atlas.addEventListener("pointerup", stopSystemRotation);
    atlas.addEventListener("pointercancel", stopSystemRotation);
    applySystemAtlasCamera();

    const partForScene = {
        digestion: { mouth: "mouth", esophagus: "esophagus", stomach: "stomach", intestine: "intestine", absorption: "absorption", large: "large" },
        respiration: { nose: "nose", lungs: "lungs", airway: "airway", alveoli: "alveoli", exchange: "exchange", body: "body" },
        nervous: { brain: "brain", "sensory-nerve": "sensory", sense: "sensory", spinal: "spinal", reaction: "muscle", motor: "motor" },
        immune: { barrier: "barrier", defense: "whitecell", antibody: "antibody", memory: "memory", vaccine: "vaccine" },
        movement: { joint: "joint", flexion: "flexor", extension: "extensor", tendon: "tendon", load: "load" },
        excretion: { filter: "kidney", reclaim: "nephron", pathway: "ureter", balance: "balance", bladder: "bladder" },
        temperature: { sense: "hypothalamus", cool: "sweat", conserve: "vessels", shiver: "muscle", balance: "core" }
    }[system];

    function updateAtlas() {
        const activePart = partForScene[scenePanel.dataset.scene] || Object.values(partForScene)[0];
        atlas.querySelectorAll(".atlas-organ").forEach((part) => {
            const isHelperStage = system === "digestion" && scenePanel.dataset.scene === "stomach" && document.getElementById("stageLocation")?.textContent.includes("작은창자");
            part.classList.toggle("is-active", part.dataset.part === activePart || (isHelperStage && part.dataset.part === "helpers"));
        });
    }

    new MutationObserver(updateAtlas).observe(scenePanel, { attributes: true, attributeFilter: ["data-scene"] });
    new MutationObserver(updateAtlas).observe(document.getElementById("stageLocation"), { childList: true });
    updateAtlas();

    const manipulationStages = {
        digestion: {
            "mouth-chewing": { type: "pump", title: "저작 압력 실험", instruction: "턱 근육을 네 번 수축해 음식 덩어리를 잘게 부수세요.", action: "턱 근육 수축", goal: 4, unit: "회", visual: "chew" },
            "mouth-saliva": { type: "toggle", title: "침과 음식 섞기", instruction: "침의 두 가지 작용을 음식에 적용해 씹은 음식이 삼키기 좋은 상태가 되게 하세요.", toggles: ["음식을 촉촉하게 하기", "녹말 소화 시작하기"], visual: "saliva" },
            "swallow-esophagus": { type: "range", title: "삼킴 이동", instruction: "음식 덩어리를 목에서 식도 입구까지 천천히 내려 보내세요.", label: "음식 위치", start: 0, min: 0, max: 100, targetMin: 88, unit: "%", visual: "bolus" },
            "esophagus-movement": { type: "pump", title: "연동운동 관찰", instruction: "식도 근육을 차례로 수축해 음식 덩어리를 위까지 밀어내세요.", action: "연동 파동 보내기", goal: 3, unit: "파동", visual: "peristalsis" },
            "stomach-mixing": { type: "pump", title: "위의 혼합 운동", instruction: "위벽을 차례로 수축해 음식과 위액을 골고루 섞으세요.", action: "위벽 수축 보내기", goal: 3, unit: "회", visual: "mix" },
            "digestive-helpers": { type: "toggle", title: "소화액 밸브", instruction: "간의 담즙과 이자의 소화효소 통로를 모두 여세요.", toggles: ["담즙 밸브", "이자액 밸브"], visual: "valves" },
            "small-intestine-digestion": { type: "dual", title: "작은창자 소화 환경", instruction: "과한 효소 농도는 낮추고 느린 장 운동은 높여 두 조건을 각각 알맞게 맞추세요.", controls: [{ label: "소화효소", start: 92, targetMin: 64, targetMax: 78 }, { label: "장 운동", start: 18, targetMin: 48, targetMax: 62 }], unit: "%", visual: "intestine" },
            "small-intestine-absorption": { type: "toggle", title: "융털의 영양소 흡수", instruction: "소화가 끝난 뒤 혈액으로 흡수되는 영양소를 골라 보내세요.", toggles: ["포도당 흡수", "아미노산 흡수"], visual: "absorb" },
            "large-intestine-water": { type: "choice", title: "큰창자의 수분 회수", instruction: "남은 찌꺼기가 지나치게 묽지도 단단하지도 않도록 알맞은 수분 상태를 고르세요.", options: ["물을 거의 흡수하지 않기", "필요한 만큼 물 흡수하기", "남은 물을 모두 흡수하기"], correctIndex: 1, visual: "water" },
            "body-exit": { type: "pump", title: "마지막 연동운동", instruction: "큰창자 벽의 수축을 이어 보내 남은 찌꺼기를 몸 밖으로 이동시키세요.", action: "연동 파동 보내기", goal: 3, unit: "파동", visual: "exit" }
        },
        respiration: {
            "air-enters-nose": { type: "toggle", title: "코의 공기 처리", instruction: "코가 들이마신 공기에 하는 세 가지 일을 모두 작동시키세요.", toggles: ["먼지 거르기", "공기 데우기", "공기 촉촉하게 하기"], visual: "filter" },
            "inhale-lungs-expand": { type: "range", title: "횡격막 조작", instruction: "횡격막을 아래로 당겨 흉강을 넓히고 폐를 팽창시키세요.", label: "흉강 팽창", start: 12, min: 0, max: 100, targetMin: 82, unit: "%", visual: "inhale" },
            "trachea": { type: "choice", title: "공기 통로 찾기", instruction: "목에서 폐로 공기가 이동할 때 지나야 하는 통로를 고르세요.", options: ["식도", "기관", "혈관"], correctIndex: 1, visual: "airway" },
            "bronchi": { type: "toggle", title: "좌우 기관지 분배", instruction: "왼쪽과 오른쪽 폐로 이어지는 공기 통로를 모두 여세요.", toggles: ["왼쪽 기관지", "오른쪽 기관지"], visual: "bronchi" },
            "alveoli-arrival": { type: "pump", title: "폐포 환기", instruction: "세 번의 부드러운 호흡으로 폐포를 공기로 채우세요.", action: "폐포에 공기 보내기", goal: 3, unit: "호흡", visual: "alveoli" },
            "oxygen-to-blood": { type: "dual", title: "폐포 기체교환", instruction: "혈액으로 가는 산소는 높이고 혈액에 남은 이산화탄소는 낮춰 기체교환을 완성하세요.", controls: [{ label: "O₂ → 혈액", start: 18, targetMin: 72, targetMax: 88 }, { label: "혈액 속 CO₂ 잔류", start: 86, targetMin: 12, targetMax: 28 }], unit: "%", visual: "exchange" },
            "oxygen-to-body": { type: "pump", title: "산소 운반", instruction: "심장 박동으로 산소가 든 혈액을 온몸의 세포까지 보내세요.", action: "순환 펌프 작동", goal: 4, unit: "박동", visual: "delivery" },
            "carbon-dioxide-return": { type: "pump", title: "이산화탄소 회수", instruction: "혈액의 순환을 이어 세포에서 생긴 이산화탄소를 폐 가까이 운반하세요.", action: "순환 이어가기", goal: 3, unit: "단계", visual: "return" },
            "carbon-dioxide-to-alveoli": { type: "choice", title: "이산화탄소 이동 방향", instruction: "혈액 속 이산화탄소가 몸 밖으로 나가려면 어느 방향으로 이동해야 하는지 고르세요.", options: ["혈액 → 폐포", "폐포 → 혈액", "폐포 → 세포"], correctIndex: 0, visual: "co2" },
            "exhale-out": { type: "pump", title: "날숨 만들기", instruction: "가슴 속 공간이 줄어드는 변화를 이어서 이산화탄소가 든 공기를 밖으로 내보내세요.", action: "날숨 단계 진행", goal: 2, unit: "단계", visual: "exhale" }
        }
    };

    const choiceList = document.getElementById("choiceList");
    const questionCard = choiceList?.closest(".question-card");
    let activeLabStageId = "";
    let labCompleted = false;

    function currentStage() {
        const stageIndex = Math.max(0, Number(document.getElementById("stageNumber")?.textContent || 1) - 1);
        return window.BODY_EXPLORER_STAGES?.[stageIndex];
    }

    const liveJourneyProfiles = {
        digestion: {
            "mouth-chewing": [148, 52, "FOOD", "입 · 씹기", "치아가 음식 덩어리를 작게 나눕니다."],
            "mouth-saliva": [150, 58, "FOOD", "입 · 침과 섞기", "침이 음식 표면을 적시고 녹말 소화를 시작합니다."],
            "swallow-esophagus": [149, 82, "FOOD", "목 · 삼키기", "음식 덩어리가 식도 입구로 이동합니다."],
            "esophagus-movement": [152, 116, "FOOD", "식도 · 연동운동", "근육 수축 파동이 음식 덩어리를 아래로 밉니다."],
            "stomach-mixing": [174, 153, "FOOD", "위 · 섞고 분해하기", "위 근육과 위액이 음식을 죽처럼 만듭니다."],
            "digestive-helpers": [192, 182, "ENZYME", "간·이자 · 소화액", "담즙과 소화효소가 작은창자로 들어옵니다."],
            "small-intestine-digestion": [160, 208, "NUTRIENT", "작은창자 · 소화 완성", "영양소가 흡수 가능한 크기로 분해됩니다."],
            "small-intestine-absorption": [158, 220, "NUTRIENT", "융털 · 혈액으로 흡수", "작아진 영양소가 창자 벽을 지나 혈액으로 갑니다."],
            "large-intestine-water": [103, 242, "WATER", "큰창자 · 물 흡수", "남은 물질에서 물을 되찾습니다."],
            "body-exit": [111, 284, "WASTE", "마지막 길 · 배출", "흡수되지 않은 찌꺼기가 몸 밖으로 이동합니다."]
        },
        respiration: {
            "air-enters-nose": [147, 52, "O₂", "코 · 공기 준비", "공기를 거르고 따뜻하고 촉촉하게 만듭니다."],
            "inhale-lungs-expand": [104, 187, "O₂", "폐 · 들숨", "가로막이 내려가 폐 속으로 공기가 들어옵니다."],
            trachea: [151, 112, "O₂", "기관 · 공기 통로", "공기가 기관을 따라 가슴 안으로 내려갑니다."],
            bronchi: [194, 174, "O₂", "기관지 · 좌우 분배", "공기가 두 기관지로 갈라져 양쪽 폐에 도착합니다."],
            "alveoli-arrival": [209, 219, "O₂", "폐포 · 공기 도착", "산소가 가득한 공기가 작은 폐포를 채웁니다."],
            "oxygen-to-blood": [238, 229, "O₂", "폐포 · 산소 이동", "산소가 얇은 폐포 벽을 지나 혈액으로 확산됩니다."],
            "oxygen-to-body": [257, 289, "O₂", "혈액 · 온몸 전달", "혈액이 산소를 온몸의 세포로 운반합니다."],
            "carbon-dioxide-return": [45, 289, "CO₂", "세포 · 이산화탄소 회수", "세포에서 생긴 이산화탄소가 혈액을 타고 폐로 돌아옵니다."],
            "carbon-dioxide-to-alveoli": [190, 259, "CO₂", "폐포 · 이산화탄소 이동", "이산화탄소가 혈액에서 폐포 안으로 확산됩니다."],
            "exhale-out": [147, 72, "CO₂", "폐 · 날숨", "가로막이 이완하며 이산화탄소가 몸 밖으로 나갑니다."]
        },
        nervous: {
            "light-path-experiment": [154, 56, "SIGNAL", "눈 → 뇌 · 빛 감지", "눈이 밝은 빛을 신경 신호로 바꾸어 뇌로 보냅니다."],
            "light-path-check": [154, 56, "SIGNAL", "뇌 · 빛 정보 확인", "뇌가 빛 정보를 판단해 눈꺼풀 근육에 명령을 준비합니다."],
            "sound-path-experiment": [58, 236, "SIGNAL", "귀 → 감각 신경", "소리 정보가 감각 신경을 따라 중추로 이동합니다."],
            "sound-path-check": [154, 56, "SIGNAL", "뇌 · 소리 정보 확인", "뇌가 소리의 의미를 해석하고 반응을 결정합니다."],
            "warmth-path-experiment": [58, 236, "SIGNAL", "피부 → 감각 신경", "피부의 온도 감각점이 따뜻함을 신호로 바꿉니다."],
            "warmth-path-check": [150, 155, "SIGNAL", "척수 · 온도 신호 전달", "척수가 손에서 온 신호를 뇌 쪽으로 빠르게 전달합니다."],
            "ball-path-experiment": [242, 239, "MOTOR", "운동 신경 → 근육", "다가오는 공을 피하라는 명령이 근육까지 도착합니다."],
            "ball-path-check": [154, 56, "SIGNAL", "뇌 · 움직임 판단", "뇌가 시각 정보를 바탕으로 몸을 움직일 방향을 정합니다."],
            "touch-path-experiment": [225, 198, "MOTOR", "뇌 → 운동 신경", "접촉을 확인한 뇌의 명령이 고개 근육으로 이동합니다."],
            "full-path-check": [242, 239, "MOTOR", "감각에서 반응까지", "감각기관·감각 신경·중추·운동 신경·근육이 한 경로로 이어집니다."]
        },
        immune: {
            "airway-barrier-experiment": [55, 89, "PATHOGEN", "피부·점막 · 침입 차단", "점액과 섬모가 병원체를 몸 밖에서 붙잡습니다."],
            "barrier-check": [55, 89, "BARRIER", "1차 방어선 확인", "피부와 점막은 병원체가 들어오기 전부터 작동합니다."],
            "innate-defense-experiment": [112, 162, "CELL", "백혈구 · 즉시 방어", "백혈구가 상처 주변의 침입자를 찾아 제거합니다."],
            "inflammation-check": [112, 162, "CELL", "염증 반응 확인", "혈류와 면역세포가 모여 침입 확산을 막습니다."],
            "antibody-match-experiment": [213, 145, "ANTIBODY", "항체 · 맞춤 결합", "항체가 모양이 맞는 병원체 표면에 정확히 결합합니다."],
            "antibody-specificity-check": [213, 145, "ANTIBODY", "항체 선택성 확인", "각 항체는 특정 병원체의 표지와 맞을 때만 결합합니다."],
            "memory-response-experiment": [94, 254, "MEMORY", "기억세포 · 재침입 감지", "기억세포가 같은 병원체를 빠르게 알아봅니다."],
            "memory-speed-check": [94, 254, "MEMORY", "2차 반응 속도 확인", "기억 덕분에 두 번째 면역 반응은 더 빠르고 강합니다."],
            "vaccine-training-experiment": [180, 233, "VACCINE", "백신 · 안전한 훈련", "안전한 병원체 정보가 기억세포 생성을 유도합니다."],
            "vaccine-purpose-check": [180, 233, "VACCINE", "면역 기억 완성", "실제 감염 전에 방어 정보를 기억해 둘 수 있습니다."]
        },
        movement: {
            "elbow-joint-experiment": [151, 172, "JOINT", "팔꿈치 · 회전축", "두 뼈가 만나는 관절에서 팔의 각도가 달라집니다."],
            "joint-function-check": [151, 172, "JOINT", "관절 기능 확인", "관절은 단단한 뼈가 서로 움직일 수 있게 합니다."],
            "elbow-flexion-experiment": [110, 105, "FORCE", "굽힘근 · 수축", "앞쪽 근육이 짧아지며 아래팔뼈를 당깁니다."],
            "flexion-muscle-check": [110, 105, "FORCE", "팔 굽힘 확인", "굽힘근은 수축하고 반대쪽 폄근은 이완합니다."],
            "elbow-extension-experiment": [125, 94, "FORCE", "폄근 · 수축", "뒤쪽 근육이 짧아지며 팔을 펴는 힘을 만듭니다."],
            "opposing-muscles-check": [125, 94, "FORCE", "반대 근육쌍 확인", "굽힘근과 폄근이 서로 반대로 작용합니다."],
            "tendon-force-experiment": [185, 230, "FORCE", "힘줄 · 힘 전달", "근육이 만든 당기는 힘이 힘줄을 거쳐 뼈로 이동합니다."],
            "tendon-ligament-check": [185, 230, "TENDON", "힘줄 연결 확인", "힘줄은 근육과 뼈를 이어 수축력을 전달합니다."],
            "lifting-load-experiment": [240, 275, "LOAD", "하중 · 물체 들기", "물체가 무겁고 멀수록 근육이 더 큰 힘을 냅니다."],
            "load-force-check": [240, 275, "LOAD", "하중과 힘 확인", "관절에서 하중까지의 거리도 필요한 힘을 바꿉니다."]
        },
        excretion: {
            "kidney-filter-experiment": [80, 105, "FILTRATE", "콩팥 · 혈액 여과", "거름막이 혈구와 큰 물질은 남기고 작은 물질을 통과시킵니다."],
            "filter-size-check": [79, 99, "FILTRATE", "여과 크기 확인", "물·염류·요소처럼 작은 물질이 네프론 안으로 들어갑니다."],
            "reclaim-experiment": [95, 132, "RECLAIM", "세뇨관 · 재흡수", "포도당과 필요한 물·염류가 다시 혈액으로 돌아갑니다."],
            "reclaim-check": [95, 132, "RECLAIM", "필요 물질 회수 확인", "몸에 필요한 물질은 오줌으로 버리지 않고 되찾습니다."],
            "urine-path-experiment": [121, 220, "URINE", "요관 · 오줌 이동", "남은 노폐물과 물이 요관을 따라 방광으로 내려갑니다."],
            "urine-route-check": [150, 270, "URINE", "배설 경로 확인", "콩팥·요관·방광·요도가 하나의 배출 경로를 이룹니다."],
            "water-balance-experiment": [150, 80, "WATER", "수분 균형 조절", "몸 상태에 따라 콩팥이 되찾는 물의 양을 바꿉니다."],
            "sweat-balance-check": [150, 80, "WATER", "더운 날 수분 확인", "땀으로 물을 잃으면 콩팥은 물을 더 많이 되찾습니다."],
            "bladder-empty-experiment": [150, 270, "URINE", "방광 · 저장과 배출", "방광 근육이 수축해 저장된 오줌을 몸 밖으로 보냅니다."],
            "bladder-role-check": [150, 270, "URINE", "배설 과정 완성", "여과·재흡수·운반·저장·배출이 차례로 이어집니다."]
        },
        temperature: {
            "temperature-sense-experiment": [150, 57, "TEMP", "시상하부 · 온도 감지", "시상하부가 혈액 온도를 기준 범위와 비교합니다."],
            "temperature-command-check": [150, 57, "TEMP", "체온 명령 확인", "감지된 차이에 맞춰 열 방출 또는 열 보존 명령을 냅니다."],
            "hot-cooling-experiment": [89, 247, "COOL", "땀샘 · 열 방출", "땀이 증발하며 피부의 열을 빼앗아 갑니다."],
            "humidity-cooling-check": [89, 247, "COOL", "증발 냉각 확인", "습도가 높으면 땀이 덜 증발해 냉각 효과가 줄어듭니다."],
            "cold-conserve-experiment": [150, 151, "HEAT", "피부 혈관 · 열 보존", "혈관이 좁아져 피부로 전달되는 열을 줄입니다."],
            "skin-vessel-compare-check": [150, 151, "HEAT", "피부 혈류 확인", "더울 때는 넓어지고 추울 때는 좁아집니다."],
            "shiver-heat-experiment": [205, 220, "HEAT", "골격근 · 열 생산", "빠른 근육 수축인 떨림이 새로운 열을 만듭니다."],
            "shiver-stop-check": [205, 220, "HEAT", "떨림 반응 확인", "체온이 회복되면 열 생산 명령과 떨림이 멈춥니다."],
            "temperature-balance-experiment": [150, 206, "TEMP", "중심 체온 · 균형", "땀·혈관·근육 반응이 함께 체온을 안정시킵니다."],
            "temperature-balance-check": [150, 206, "TEMP", "항상성 회복 완료", "상황이 달라도 중심 체온은 좁은 범위로 돌아옵니다."]
        }
    };

    const liveJourney = liveJourneyProfiles[system];
    if (liveJourney) {
        const svg = atlas.querySelector("svg");
        svg.insertAdjacentHTML("beforeend", `
            <g class="atlas-live-marker" aria-hidden="true">
                <circle class="atlas-marker-wave" r="17"></circle>
                <circle class="atlas-marker-core" r="8"></circle>
                <text class="atlas-marker-text" text-anchor="middle" y="3">LIVE</text>
            </g>
        `);
        atlas.insertAdjacentHTML("beforeend", `
            <aside class="atlas-telemetry" aria-live="polite">
                <div>
                    <span><em>LIVE JOURNEY</em><b>01 / 10</b></span>
                    <strong>이동 경로 준비</strong>
                </div>
                <p>탐험을 시작하면 현재 물질과 기관의 변화가 표시됩니다.</p>
                <div class="atlas-journey-rail" aria-label="전체 과정 미리보기">
                    ${window.BODY_EXPLORER_STAGES.map((stage, index) => `<button type="button" aria-label="${index + 1}단계 ${stage.location} 미리보기"><i></i></button>`).join("")}
                </div>
                <button type="button" class="atlas-return-live">현재 단계로</button>
            </aside>
        `);

        const marker = atlas.querySelector(".atlas-live-marker");
        const markerText = atlas.querySelector(".atlas-marker-text");
        const telemetry = atlas.querySelector(".atlas-telemetry");
        const telemetryMode = telemetry.querySelector("em");
        const telemetryStep = telemetry.querySelector("b");
        const telemetryTitle = telemetry.querySelector("strong");
        const telemetryDescription = telemetry.querySelector("p");
        const telemetryRailButtons = [...telemetry.querySelectorAll(".atlas-journey-rail button")];
        const returnLiveButton = telemetry.querySelector(".atlas-return-live");
        const compactMarkerLabels = {
            PATHOGEN: "X", BARRIER: "WALL", CELL: "WBC", ANTIBODY: "Ab", MEMORY: "MEM", VACCINE: "VAC",
            SIGNAL: "SIG", MOTOR: "MTR", JOINT: "JNT", FORCE: "F", TENDON: "TND", LOAD: "KG",
            FILTRATE: "F", RECLAIM: "↺", URINE: "U", TEMP: "°C", COOL: "↓", HEAT: "↑",
            NUTRIENT: "N", ENZYME: "ENZ", WATER: "H₂O", WASTE: "W"
        };

        const renderJourneyPoint = (stage, stageNumber, previewing = false) => {
            const journey = liveJourney[stage?.id];
            if (!stage || !journey) return;
            const [x, y, material, title, description] = journey;

            marker.style.setProperty("--marker-x", `${x}px`);
            marker.style.setProperty("--marker-y", `${y}px`);
            marker.dataset.material = material;
            markerText.textContent = compactMarkerLabels[material] || material;
            telemetryStep.textContent = `${String(stageNumber).padStart(2, "0")} / 10`;
            telemetryTitle.textContent = title;
            telemetryDescription.textContent = description;
            telemetryMode.textContent = previewing ? "ROUTE PREVIEW" : "LIVE JOURNEY";
            telemetry.classList.toggle("is-previewing", previewing);
            telemetryRailButtons.forEach((button, index) => {
                const segment = button.querySelector("i");
                segment.classList.toggle("is-passed", !previewing && index < stageNumber - 1);
                segment.classList.toggle("is-current", index === stageNumber - 1);
                button.toggleAttribute("aria-current", index === stageNumber - 1);
            });
            atlas.style.setProperty("--journey-progress", `${stageNumber * 10}%`);
        };

        const renderLiveJourney = () => {
            const stageNumber = Math.max(1, Number(document.getElementById("stageNumber")?.textContent || 1));
            renderJourneyPoint(currentStage(), stageNumber);
        };

        telemetryRailButtons.forEach((button, index) => {
            button.addEventListener("click", () => {
                const previewStage = window.BODY_EXPLORER_STAGES[index];
                if (!liveJourney[previewStage?.id]) return;
                renderJourneyPoint(previewStage, index + 1, true);
            });
        });
        returnLiveButton.addEventListener("click", renderLiveJourney);

        document.addEventListener("body-explorer-stage-rendered", renderLiveJourney);
        new MutationObserver(renderLiveJourney).observe(document.getElementById("stageNumber"), { childList: true });
        renderLiveJourney();
    }

    function finishManipulation(stage, lab) {
        if (labCompleted) return;
        labCompleted = true;
        lab.classList.add("is-complete");
        lab.querySelector(".organ-lab-status").innerHTML = "<b>관찰 완료</b><span>해부 지도에서 실제 변화가 확인되었습니다.</span>";
        atlas.classList.add("is-reacting");
        window.setTimeout(() => atlas.classList.remove("is-reacting"), 900);

        const correctButton = [...choiceList.querySelectorAll(".choice-button")]
            .find((button) => button.dataset.choice === stage.answer);
        correctButton?.click();
    }

    function progressMarkup(config) {
        return `<div class="organ-lab-visual" data-visual="${config.visual}">
            <div class="lab-specimen"><i></i><i></i><i></i><span></span></div>
            <div class="lab-readout"><small>LIVE RESPONSE</small><strong>0${config.unit || "%"}</strong></div>
        </div>`;
    }

    function updateVisual(lab, value, unit = "%") {
        const normalized = Math.max(0, Math.min(100, value));
        lab.style.setProperty("--lab-progress", `${normalized}%`);
        lab.style.setProperty("--lab-size", `${32 + normalized * .54}px`);
        lab.style.setProperty("--lab-rotation", `${normalized * 1.2}deg`);
        lab.style.setProperty("--particle-rise", `${normalized * .46}%`);
        const readout = lab.querySelector(".lab-readout strong");
        if (readout) readout.textContent = `${Math.round(value)}${unit}`;
        lab.querySelector(".lab-specimen")?.setAttribute("data-level", String(Math.round(normalized)));
    }

    function buildRangeControl(config, lab, onReady) {
        const wrap = document.createElement("label");
        wrap.className = "organ-range-control";
        wrap.innerHTML = `<span><b>${config.label}</b><output>${config.start}${config.unit}</output></span>
            <input type="range" min="${config.min}" max="${config.max}" value="${config.start}" aria-label="${config.label}">
            <small>${config.targetMax != null ? `목표 구간 ${config.targetMin}–${config.targetMax}${config.unit}` : `목표 ${config.targetMin}${config.unit} 이상`}</small>`;
        const input = wrap.querySelector("input");
        const output = wrap.querySelector("output");
        const apply = () => {
            const value = Number(input.value);
            output.value = `${value}${config.unit}`;
            output.textContent = `${value}${config.unit}`;
            updateVisual(lab, value, config.unit);
            const ready = value >= config.targetMin && (config.targetMax == null || value <= config.targetMax);
            wrap.classList.toggle("is-target", ready);
            if (ready) onReady();
        };
        input.addEventListener("input", apply);
        apply();
        return wrap;
    }

    function buildPumpControl(config, lab, onReady) {
        const wrap = document.createElement("div");
        wrap.className = "organ-pump-control";
        wrap.innerHTML = `<button type="button"><span>${config.action}</span><small>0 / ${config.goal} ${config.unit}</small></button>
            <div class="pulse-track">${Array.from({ length: config.goal }, () => "<i></i>").join("")}</div>`;
        let count = 0;
        const button = wrap.querySelector("button");
        button.addEventListener("click", () => {
            if (count >= config.goal) return;
            count += 1;
            wrap.querySelectorAll(".pulse-track i")[count - 1]?.classList.add("is-on");
            button.querySelector("small").textContent = `${count} / ${config.goal} ${config.unit}`;
            lab.classList.remove("is-pulsing");
            void lab.offsetWidth;
            lab.classList.add("is-pulsing");
            updateVisual(lab, (count / config.goal) * 100);
            lab.querySelector(".lab-readout strong").textContent = `${count}${config.unit}`;
            if (count >= config.goal) onReady();
        });
        return wrap;
    }

    function buildToggleControl(config, lab, onReady) {
        const wrap = document.createElement("div");
        wrap.className = "organ-toggle-control";
        config.toggles.forEach((label, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.innerHTML = `<i></i><span>${label}</span><small>닫힘</small>`;
            button.addEventListener("click", () => {
                button.classList.toggle("is-open");
                button.querySelector("small").textContent = button.classList.contains("is-open") ? "열림" : "닫힘";
                const opened = wrap.querySelectorAll(".is-open").length;
                updateVisual(lab, (opened / config.toggles.length) * 100);
                if (opened === config.toggles.length) onReady();
            });
            wrap.append(button);
        });
        return wrap;
    }

    function buildChoiceControl(config, lab, onReady) {
        const wrap = document.createElement("div");
        wrap.className = "organ-choice-control";
        config.options.forEach((option, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.innerHTML = `<span>${option}</span>`;
            button.addEventListener("click", () => {
                if (labCompleted) return;
                wrap.querySelectorAll("button").forEach((item) => item.classList.remove("is-wrong"));
                if (index !== config.correctIndex) {
                    button.classList.add("is-wrong");
                    document.dispatchEvent(new CustomEvent("body-explorer-manipulation-error", {
                        detail: { chosen: option }
                    }));
                    lab.querySelector(".organ-lab-status").innerHTML = "<b>다시 관찰</b><span>기관의 역할과 물질이 이동해야 하는 방향을 다시 생각해 보세요.</span>";
                    updateVisual(lab, 24);
                    return;
                }
                button.classList.add("is-correct");
                wrap.querySelectorAll("button").forEach((item) => {
                    item.disabled = true;
                });
                updateVisual(lab, 100);
                onReady();
            });
            wrap.append(button);
        });
        return wrap;
    }

    function buildDualControl(config, lab, onReady) {
        const wrap = document.createElement("div");
        wrap.className = "organ-dual-control";
        config.controls.forEach((control) => {
            const label = document.createElement("label");
            label.innerHTML = `<span><b>${control.label}</b><output>${control.start}${config.unit}</output></span>
                <input type="range" min="0" max="100" value="${control.start}" aria-label="${control.label}">
                <small>목표 구간 ${control.targetMin}–${control.targetMax}${config.unit}</small>`;
            const input = label.querySelector("input");
            input.addEventListener("input", () => {
                label.querySelector("output").value = `${input.value}${config.unit}`;
                label.querySelector("output").textContent = `${input.value}${config.unit}`;
                const values = [...wrap.querySelectorAll("input")].map((item) => Number(item.value));
                updateVisual(lab, values.reduce((sum, value) => sum + value, 0) / values.length, config.unit);
                const value = Number(input.value);
                label.classList.toggle("is-target", value >= control.targetMin && value <= control.targetMax);
                if (values.length === config.controls.length && values.every((item, index) => {
                    const target = config.controls[index];
                    return item >= target.targetMin && item <= target.targetMax;
                })) onReady();
            });
            wrap.append(label);
        });
        return wrap;
    }

    function renderManipulationLab() {
        const stage = currentStage();
        const config = manipulationStages[system]?.[stage?.id];
        if (!stage || !config || !questionCard || choiceList.children.length === 0) return;
        if (stage.id === activeLabStageId && document.querySelector(".organ-manipulation-lab")) return;

        activeLabStageId = stage.id;
        labCompleted = false;
        questionCard.querySelector(".organ-manipulation-lab")?.remove();
        questionCard.classList.add("direct-manipulation-active");
        document.getElementById("stageQuestion").textContent = config.title;
        const questionKicker = questionCard.querySelector(".question-kicker");
        if (questionKicker) questionKicker.textContent = "장기를 직접 조작하고 변화를 관찰하세요";

        const lab = document.createElement("section");
        lab.className = "organ-manipulation-lab";
        lab.setAttribute("aria-label", `${config.title} 직접 조작`);
        lab.innerHTML = `<header><span>DIRECT MANIPULATION · ${String(Number(document.getElementById("stageNumber")?.textContent || 1)).padStart(2, "0")}</span><h3>${config.title}</h3><p>${config.instruction}</p></header>
            ${progressMarkup(config)}
            <div class="organ-lab-controls"></div>
            <div class="organ-lab-status"><b>조작 대기</b><span>컨트롤을 움직이면 장기의 반응이 표시됩니다.</span></div>`;

        const complete = () => finishManipulation(stage, lab);
        let control;
        if (config.type === "range") control = buildRangeControl(config, lab, complete);
        if (config.type === "pump") control = buildPumpControl(config, lab, complete);
        if (config.type === "toggle") control = buildToggleControl(config, lab, complete);
        if (config.type === "dual") control = buildDualControl(config, lab, complete);
        if (config.type === "choice") control = buildChoiceControl(config, lab, complete);
        lab.querySelector(".organ-lab-controls").append(control);
        questionCard.insertBefore(lab, choiceList);
    }

    if (choiceList) {
        new MutationObserver(renderManipulationLab).observe(choiceList, { childList: true });
        new MutationObserver(renderManipulationLab).observe(document.getElementById("stageNumber"), { childList: true });
        renderManipulationLab();
    }

    const physiologyProfiles = {
        nervous: {
            title: "신경 반응 조절",
            label: "신경 신호 전도율",
            instruction: "자극과 신경 반응을 각각 표시된 목표 구간에 맞추세요. 지나치게 강한 반응도 실패합니다.",
            result: "감각 정보가 중추에서 처리되어 운동 명령으로 전환됩니다.",
            visual: "neural"
        },
        immune: {
            title: "면역 반응 조절",
            label: "방어 반응 활성도",
            instruction: "침입 신호와 방어 반응을 목표 구간에 맞추세요. 과도한 면역 반응은 조직도 해칠 수 있습니다.",
            result: "면역세포가 침입자를 인식하고 제거 반응을 시작합니다.",
            visual: "immune"
        },
        movement: {
            title: "근육 수축 조절",
            label: "근육 수축력",
            instruction: "움직임 자극과 수축력을 목표 구간에 맞추세요. 힘이 너무 세면 동작이 불안정해집니다.",
            result: "근육의 힘이 힘줄을 거쳐 뼈에 전달되어 관절이 움직입니다.",
            visual: "muscle"
        },
        excretion: {
            title: "콩팥 기능 조절",
            label: "여과·재흡수 효율",
            instruction: "혈액 상태와 네프론 처리 효율을 목표 구간에 맞추세요. 지나친 여과도 필요한 물질을 잃게 합니다.",
            result: "필요한 물질은 되찾고 노폐물과 남는 물은 오줌으로 이동합니다.",
            visual: "kidney"
        },
        temperature: {
            title: "체온 반응 조절",
            label: "체온 보정 반응",
            instruction: "온도 변화와 보정 반응을 목표 구간에 맞추세요. 과잉 반응은 체온을 반대로 벗어나게 합니다.",
            result: "시상하부의 명령에 따라 열 방출 또는 열 보존 반응이 작동합니다.",
            visual: "thermal"
        }
    };

    // The shared percentage-matching console made five different body systems
    // feel like the same mission and silently completed the real path-building
    // task. Keep the system-specific path experiment as the primary interaction.
    const physiologyProfile = null;
    const simulationCard = document.getElementById("simulationCard");
    let activePhysiologyStage = "";
    let physiologyCompleting = false;
    const physiologyGoalPatterns = [
        { stimulusOffset: [0, 12], response: [58, 70], responseStart: 90 },
        { stimulusOffset: [-6, 8], response: [76, 88], responseStart: 22 },
        { stimulusOffset: [3, 15], response: [44, 58], responseStart: 86 },
        { stimulusOffset: [-4, 7], response: [64, 78], responseStart: 18 },
        { stimulusOffset: [0, 10], response: [50, 64], responseStart: 88 }
    ];

    function physiologyGoalFor(stage) {
        const experiments = window.BODY_EXPLORER_STAGES.filter((item) => item.kind === "experiment");
        const experimentIndex = Math.max(0, experiments.findIndex((item) => item.id === stage.id));
        const pattern = physiologyGoalPatterns[experimentIndex % physiologyGoalPatterns.length];
        const clamp = (value) => Math.max(0, Math.min(100, value));
        return {
            stimulusMin: clamp(stage.scenario.threshold + pattern.stimulusOffset[0]),
            stimulusMax: clamp(stage.scenario.threshold + pattern.stimulusOffset[1]),
            responseMin: pattern.response[0],
            responseMax: pattern.response[1],
            responseStart: pattern.responseStart
        };
    }

    function isInTargetRange(value, minimum, maximum) {
        return value >= minimum && value <= maximum;
    }

    function assembleHiddenCorrectPath(stage) {
        stage.scenario.correctPath.forEach((component) => {
            const button = [...document.querySelectorAll("#componentBank .component-button")]
                .find((item) => item.textContent.trim() === component);
            button?.click();
        });
    }

    function completePhysiologyExperiment(stage, consoleElement, responseInput) {
        if (physiologyCompleting) return;
        physiologyCompleting = true;
        consoleElement.classList.add("is-complete");
        consoleElement.querySelector(".physiology-status").innerHTML = `<b>생리 반응 생성</b><span>${physiologyProfile.result}</span>`;
        responseInput.disabled = true;
        assembleHiddenCorrectPath(stage);
        document.getElementById("runSimulationButton")?.click();
    }

    function renderPhysiologyConsole() {
        if (!physiologyProfile || !simulationCard) return;
        const stage = currentStage();
        const isExperiment = stage?.kind === "experiment" && stage.scenario;

        if (!isExperiment) {
            simulationCard.classList.remove("physiology-direct-active");
            simulationCard.querySelector(".physiology-direct-console")?.remove();
            activePhysiologyStage = "";
            physiologyCompleting = false;
            return;
        }
        const desiredTitle = `${stage.scenario.stimulus} · ${physiologyProfile.title}`;
        if (stage.id === activePhysiologyStage && simulationCard.querySelector(".physiology-direct-console")) {
            const currentConsole = simulationCard.querySelector(".physiology-direct-console");
            const currentTitle = document.getElementById("simulationTitle");
            if (currentTitle && currentTitle.textContent !== desiredTitle) currentTitle.textContent = desiredTitle;
            const currentMission = document.getElementById("stageMission");
            if (currentMission && currentMission.textContent !== physiologyProfile.instruction) currentMission.textContent = physiologyProfile.instruction;
            currentConsole.syncGoalState?.();
            return;
        }

        activePhysiologyStage = stage.id;
        physiologyCompleting = false;
        const goal = physiologyGoalFor(stage);
        simulationCard.querySelector(".physiology-direct-console")?.remove();
        simulationCard.classList.add("physiology-direct-active");
        const simulationTitle = document.getElementById("simulationTitle");
        if (simulationTitle) simulationTitle.textContent = desiredTitle;
        const stageMission = document.getElementById("stageMission");
        if (stageMission) stageMission.textContent = physiologyProfile.instruction;

        const directConsole = document.createElement("section");
        directConsole.className = "physiology-direct-console";
        directConsole.dataset.visual = physiologyProfile.visual;
        directConsole.innerHTML = `
            <div class="physiology-visual" aria-hidden="true">
                <div class="physiology-core"><i></i><i></i><i></i><span></span></div>
                <small>LIVE PHYSIOLOGY</small>
            </div>
            <div class="physiology-control">
                <span class="physiology-kicker">DIRECT RESPONSE CONTROL</span>
                <h3>${physiologyProfile.title}</h3>
                <p>${physiologyProfile.instruction}</p>
                <label>
                    <span><b>${physiologyProfile.label}</b><output>${goal.responseStart}%</output></span>
                    <input type="range" min="0" max="100" value="${goal.responseStart}" aria-label="${physiologyProfile.label}">
                    <small>반응 목표 ${goal.responseMin}–${goal.responseMax}%</small>
                </label>
            </div>
            <div class="physiology-status"><b>균형 조절</b><span>자극 ${goal.stimulusMin}–${goal.stimulusMax}%, 반응 ${goal.responseMin}–${goal.responseMax}%를 맞추세요.</span></div>`;

        const pathBuilder = simulationCard.querySelector(".path-builder");
        simulationCard.insertBefore(directConsole, pathBuilder);
        const responseInput = directConsole.querySelector("input");
        const stimulusInput = document.getElementById("stimulusIntensity");
        const output = directConsole.querySelector("output");
        const stimulusThreshold = document.getElementById("stimulusThreshold");

        const updateResponse = () => {
            if (stage.id !== activePhysiologyStage || !directConsole.isConnected) return;
            const response = Number(responseInput.value);
            const stimulus = Number(stimulusInput.value);
            if (stimulusThreshold) {
                stimulusThreshold.textContent = `${stage.scenario.intensityLabel} · 목표 ${goal.stimulusMin}–${goal.stimulusMax}%`;
            }
            output.value = `${response}%`;
            output.textContent = `${response}%`;
            directConsole.style.setProperty("--physiology-response", `${response}%`);
            directConsole.style.setProperty("--physiology-stimulus", `${stimulus}%`);
            directConsole.style.setProperty("--physiology-size", `${32 + response * .46}px`);
            directConsole.style.setProperty("--physiology-rise", `${response * .45}%`);
            const stimulusReady = isInTargetRange(stimulus, goal.stimulusMin, goal.stimulusMax);
            const responseReady = isInTargetRange(response, goal.responseMin, goal.responseMax);
            directConsole.classList.toggle("has-stimulus", stimulusReady);
            directConsole.classList.toggle("has-response", responseReady);
            const stimulusDirection = stimulus < goal.stimulusMin ? "높이세요" : "낮추세요";
            const responseDirection = response < goal.responseMin ? "높이세요" : "낮추세요";
            directConsole.querySelector(".physiology-status").innerHTML = stimulusReady
                ? (responseReady
                    ? "<b>균형 완성</b><span>자극과 생리 반응이 모두 안정 구간에 들어왔습니다.</span>"
                    : `<b>자극 적정</b><span>${physiologyProfile.label}을 ${responseDirection} (${goal.responseMin}–${goal.responseMax}%)</span>`)
                : `<b>자극 조정</b><span>${stage.scenario.intensityLabel}를 ${stimulusDirection} (${goal.stimulusMin}–${goal.stimulusMax}%)</span>`;
            if (stimulusReady && responseReady) completePhysiologyExperiment(stage, directConsole, responseInput);
        };

        responseInput.addEventListener("input", updateResponse);
        stimulusInput.addEventListener("input", updateResponse);
        directConsole.syncGoalState = () => {
            if (stage.id !== activePhysiologyStage || !directConsole.isConnected) return;
            if (stimulusThreshold) {
                stimulusThreshold.textContent = `${stage.scenario.intensityLabel} · 목표 ${goal.stimulusMin}–${goal.stimulusMax}%`;
            }
            updateResponse();
        };
        directConsole.syncGoalState();
    }

    if (physiologyProfile && simulationCard) {
        let physiologyRenderQueued = false;
        const queuePhysiologyRender = () => {
            if (physiologyRenderQueued) return;
            physiologyRenderQueued = true;
            window.requestAnimationFrame(() => {
                physiologyRenderQueued = false;
                renderPhysiologyConsole();
            });
        };
        document.addEventListener("body-explorer-stage-rendered", () => {
            renderPhysiologyConsole();
            queuePhysiologyRender();
        });
        new MutationObserver(queuePhysiologyRender).observe(simulationCard, {
            attributes: true,
            attributeFilter: ["class"]
        });
        renderPhysiologyConsole();
    }
})();
