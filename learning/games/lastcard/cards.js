(() => {
    "use strict";

    const COLORS = ["ember", "tide", "leaf", "volt"];
    const COLOR_NAMES = {
        ember: "엠버",
        tide: "타이드",
        leaf: "리프",
        volt: "볼트",
        shift: "시프트"
    };
    const ACTIONS = [
        { value: "⨯", name: "SKIP", description: "다음 차례 건너뛰기" },
        { value: "↻", name: "TURN", description: "진행 방향 바꾸기" },
        { value: "+2", name: "DRAW", description: "카드 두 장 추가" }
    ];

    function createFace(className) {
        const face = document.createElement("span");
        face.className = `last-card__face ${className}`;
        return face;
    }

    function createCorner(value, position) {
        const corner = document.createElement("span");
        corner.className = `last-card__corner last-card__corner--${position}`;

        const label = document.createElement("span");
        label.className = "last-card__corner-label";
        label.textContent = value;

        const dot = document.createElement("span");
        dot.className = "last-card__corner-dot";
        dot.setAttribute("aria-hidden", "true");

        corner.append(label, dot);
        return corner;
    }

    function createWildMark() {
        const mark = document.createElement("span");
        mark.className = "last-card__wild-mark";
        mark.setAttribute("aria-hidden", "true");
        for (let index = 0; index < 4; index += 1) {
            mark.append(document.createElement("span"));
        }
        return mark;
    }

    function createBack() {
        const back = createFace("last-card__back");
        const logo = document.createElement("span");
        logo.className = "last-card__back-logo";

        const title = document.createElement("strong");
        title.textContent = "LAST\nCARD";
        title.style.whiteSpace = "pre-line";

        const subtitle = document.createElement("span");
        subtitle.textContent = "MATCH TO WIN";

        logo.append(title, subtitle);
        back.append(logo);
        return back;
    }

    function getAccessibleName(card) {
        if (card.kind === "shift") return "시프트 카드, 원하는 색으로 전환";
        if (card.kind === "action") {
            return `${COLOR_NAMES[card.color]} ${card.name} 카드, ${card.description}`;
        }
        return `${COLOR_NAMES[card.color]} 숫자 ${card.value} 카드`;
    }

    function createCard(card, options = {}) {
        const element = document.createElement(options.interactive === false ? "div" : "button");
        element.className = "last-card";
        element.dataset.color = card.color;
        element.dataset.kind = card.kind;

        if (element.tagName === "BUTTON") {
            element.type = "button";
            element.setAttribute("aria-label", `${getAccessibleName(card)}. 눌러서 뒤집기`);
            element.setAttribute("aria-pressed", "false");
            element.addEventListener("click", () => {
                const flipped = element.classList.toggle("is-flipped");
                element.setAttribute("aria-pressed", String(flipped));
            });
        } else {
            element.setAttribute("aria-label", getAccessibleName(card));
            element.setAttribute("role", "img");
        }

        if (options.flipped) element.classList.add("is-flipped");

        const inner = document.createElement("span");
        inner.className = "last-card__inner";

        const front = createFace("last-card__front");
        const cornerValue = card.kind === "shift" ? "◆" : card.value;
        front.append(createCorner(cornerValue, "top"));

        const center = document.createElement("span");
        center.className = "last-card__center";
        if (card.kind === "shift") {
            center.append(createWildMark());
        } else {
            const value = document.createElement("span");
            value.className = "last-card__value";
            value.textContent = card.value;
            center.append(value);
        }
        front.append(center);

        if (card.kind === "action" || card.kind === "shift") {
            const actionName = document.createElement("span");
            actionName.className = "last-card__action-name";
            actionName.textContent = card.name;
            front.append(actionName);
        }

        front.append(createCorner(cornerValue, "bottom"));
        inner.append(front, createBack());
        element.append(inner);
        return element;
    }

    const deck = COLORS.flatMap((color) => [
        ...Array.from({ length: 10 }, (_, value) => ({
            id: `${color}-${value}`,
            color,
            kind: "number",
            value: String(value)
        })),
        ...ACTIONS.map((action) => ({
            id: `${color}-${action.name.toLowerCase()}`,
            color,
            kind: "action",
            ...action
        }))
    ]);

    deck.push({
        id: "shift",
        color: "shift",
        kind: "shift",
        value: "◆",
        name: "SHIFT",
        description: "원하는 색으로 전환"
    });

    function renderHero() {
        const heroDeck = document.getElementById("heroDeck");
        if (!heroDeck) return;
        const heroCards = [
            deck.find((card) => card.id === "ember-7"),
            deck.find((card) => card.id === "tide-turn"),
            deck.find((card) => card.id === "shift"),
            deck.find((card) => card.id === "leaf-skip"),
            deck.find((card) => card.id === "volt-draw")
        ];
        heroCards.forEach((card) => heroDeck.append(createCard(card, { interactive: false })));
    }

    function renderGrid(filter = "all") {
        const grid = document.getElementById("cardGrid");
        if (!grid) return;
        const visibleCards = filter === "all"
            ? deck
            : deck.filter((card) => card.kind === filter);
        grid.replaceChildren(...visibleCards.map((card) => createCard(card)));
    }

    function bindControls() {
        const flipButton = document.getElementById("flipHeroButton");
        const heroDeck = document.getElementById("heroDeck");
        if (flipButton && heroDeck) {
            flipButton.addEventListener("click", () => {
                const heroCards = [...heroDeck.querySelectorAll(".last-card")];
                const shouldFlip = heroCards.some((card) => !card.classList.contains("is-flipped"));
                heroCards.forEach((card) => card.classList.toggle("is-flipped", shouldFlip));
                flipButton.textContent = shouldFlip ? "앞면 보기" : "카드 뒤집기";
            });
        }

        document.querySelectorAll(".filter-button").forEach((button) => {
            button.addEventListener("click", () => {
                document.querySelectorAll(".filter-button").forEach((item) => {
                    item.classList.toggle("is-active", item === button);
                });
                renderGrid(button.dataset.filter || "all");
            });
        });
    }

    renderHero();
    renderGrid();
    bindControls();

    window.LastCardDesign = Object.freeze({ COLORS, ACTIONS, deck, createCard });
})();
