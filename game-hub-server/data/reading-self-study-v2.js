"use strict";

// The classroom pilot bank stays deliberately small and reviewed.  This
// catalogue supplies broader, low-stakes self-study practice without changing
// the teacher review workflow.
const TOPICS = [
  {
    key: "SCI-WATER-CYCLE",
    ko: "물의 순환",
    en: "The Water Cycle",
    facts: [
      ["햇빛을 받은 물은 수증기가 되어 공기 중으로 올라간다.", "Water warmed by sunlight can become vapor and rise into the air."],
      ["수증기가 식으면 작은 물방울로 변해 구름을 이룬다.", "When water vapor cools, it forms tiny droplets that make clouds."],
      ["구름 속 물방울이 무거워지면 비나 눈으로 내린다.", "When droplets in clouds become heavy, they fall as rain or snow."],
      ["땅에 내린 물의 일부는 흙 속으로 스며든다.", "Some water that reaches the ground soaks into the soil."],
      ["강과 지하수의 물은 다시 바다로 흘러갈 수 있다.", "Water in rivers and underground can flow back to the ocean."],
      ["식물은 잎을 통해 수증기를 공기 중으로 내보낸다.", "Plants release water vapor into the air through their leaves."],
      ["물의 순환은 물이 여러 장소와 상태 사이를 이동하는 과정이다.", "The water cycle moves water among places and physical states."],
      ["물의 순환을 움직이는 주요 에너지원은 태양이다.", "The Sun is the main energy source that drives the water cycle."]
    ],
    wrong: [
      ["구름은 물이 사라져서 생긴 빈 공간이다.", "Clouds are empty spaces left when water disappears."],
      ["비는 바닷물이 그대로 하늘에서 쏟아지는 현상이다.", "Rain is ocean water poured directly from the sky."],
      ["지하수는 물의 순환에 참여하지 않는다.", "Groundwater does not take part in the water cycle."],
      ["물은 증발하면 영원히 지구 밖으로 사라진다.", "Once water evaporates, it leaves Earth forever."],
      ["태양은 물의 순환과 관계가 없다.", "The Sun has no role in the water cycle."]
    ]
  },
  {
    key: "SCI-ECOSYSTEM",
    ko: "생태계의 연결",
    en: "Connections in Ecosystems",
    facts: [
      ["생산자는 햇빛 등의 에너지를 이용해 스스로 양분을 만든다.", "Producers use energy such as sunlight to make their own food."],
      ["소비자는 다른 생물을 먹어 에너지를 얻는다.", "Consumers get energy by eating other organisms."],
      ["분해자는 죽은 생물을 분해해 물질이 다시 순환하도록 돕는다.", "Decomposers break down dead organisms and help matter cycle again."],
      ["먹이 그물은 여러 먹이 사슬이 서로 연결된 모습이다.", "A food web shows how several food chains are connected."],
      ["한 종의 수가 크게 변하면 연결된 다른 종에도 영향이 갈 수 있다.", "A large change in one population can affect other connected species."],
      ["서식지는 생물이 먹이와 물, 공간을 얻어 살아가는 장소다.", "A habitat is where an organism finds food, water, and space to live."],
      ["생물 다양성이 높으면 환경 변화에 대응할 가능성이 커질 수 있다.", "Greater biodiversity can improve an ecosystem's ability to handle change."],
      ["에너지는 먹이 관계를 따라 이동하지만 양은 단계마다 줄어든다.", "Energy moves through feeding relationships but decreases at each step."]
    ],
    wrong: [
      ["소비자는 햇빛만으로 양분을 만든다.", "Consumers make food using only sunlight."],
      ["분해자는 생태계에서 아무 역할도 하지 않는다.", "Decomposers have no role in ecosystems."],
      ["먹이 그물의 생물들은 서로 영향을 주지 않는다.", "Organisms in a food web do not affect one another."],
      ["서식지는 모든 생물에게 완전히 같은 환경이다.", "A habitat is exactly the same environment for every organism."],
      ["먹이 사슬의 위쪽으로 갈수록 에너지가 늘어난다.", "Energy increases at higher levels of a food chain."]
    ]
  },
  {
    key: "SCI-WEATHER-CLIMATE",
    ko: "날씨와 기후",
    en: "Weather and Climate",
    facts: [
      ["날씨는 특정 장소의 짧은 기간 동안 나타나는 대기 상태다.", "Weather is the state of the atmosphere at a place over a short time."],
      ["기후는 한 지역의 날씨를 오랫동안 관찰해 나타낸 경향이다.", "Climate describes long-term weather patterns in a region."],
      ["하루의 추운 날씨 하나만으로 장기적인 기후 변화를 판단할 수 없다.", "One cold day cannot by itself show a long-term climate change."],
      ["기온, 강수량, 바람은 날씨를 설명하는 요소다.", "Temperature, precipitation, and wind are elements of weather."],
      ["기후를 비교하려면 여러 해 동안 모은 자료가 필요하다.", "Comparing climates requires data collected over many years."],
      ["바다와 산맥은 지역의 기후에 영향을 줄 수 있다.", "Oceans and mountain ranges can influence regional climate."],
      ["일기 예보는 관측 자료와 모형을 사용해 앞으로의 날씨를 예상한다.", "Weather forecasts use observations and models to predict future conditions."],
      ["기후의 평균이 비슷해도 극한 날씨의 빈도는 달라질 수 있다.", "Places with similar climate averages can differ in extreme weather frequency."]
    ],
    wrong: [
      ["날씨와 기후는 기간과 관계없이 완전히 같은 뜻이다.", "Weather and climate mean exactly the same thing at every timescale."],
      ["오늘 비가 오면 그 지역의 기후는 항상 비가 오는 기후다.", "If it rains today, the region always has a rainy climate."],
      ["기후는 하루 동안의 관측만으로 정한다.", "Climate is determined from only one day of observations."],
      ["산과 바다는 기후에 영향을 줄 수 없다.", "Mountains and oceans cannot affect climate."],
      ["일기 예보에는 관측 자료가 필요하지 않다.", "Weather forecasts do not need observational data."]
    ]
  },
  {
    key: "SCI-ENERGY",
    ko: "에너지의 전환",
    en: "Energy Transformations",
    facts: [
      ["전구는 전기 에너지의 일부를 빛 에너지로 바꾼다.", "A lamp changes some electrical energy into light energy."],
      ["움직이는 물체는 운동 에너지를 가진다.", "A moving object has kinetic energy."],
      ["높은 곳에 있는 물체는 위치와 관련된 에너지를 가질 수 있다.", "An object above the ground can have energy related to its position."],
      ["배터리는 저장된 화학 에너지를 전기 에너지로 바꿀 수 있다.", "A battery can change stored chemical energy into electrical energy."],
      ["에너지는 전환 과정에서 사라지기보다 다른 형태로 이동하거나 바뀐다.", "During a transformation, energy moves or changes form rather than vanishing."],
      ["마찰이 일어나면 운동 에너지의 일부가 열에너지로 바뀔 수 있다.", "Friction can change some kinetic energy into thermal energy."],
      ["태양 전지는 빛 에너지를 전기 에너지로 전환한다.", "Solar cells transform light energy into electrical energy."],
      ["기계의 효율은 들어간 에너지 중 유용하게 전환된 비율과 관련된다.", "Machine efficiency relates to the fraction of input energy changed usefully."]
    ],
    wrong: [
      ["전구는 에너지를 아무것도 없는 상태에서 새로 만든다.", "A lamp creates energy from nothing."],
      ["멈춘 물체만 운동 에너지를 가진다.", "Only stationary objects have kinetic energy."],
      ["배터리에는 어떤 형태의 에너지도 저장되지 않는다.", "A battery stores no form of energy."],
      ["마찰은 열과 아무 관련이 없다.", "Friction has nothing to do with thermal energy."],
      ["태양 전지는 빛을 소리로만 바꾼다.", "Solar cells change light only into sound."]
    ]
  },
  {
    key: "TECH-DIGITAL-SAFETY",
    ko: "디지털 안전",
    en: "Digital Safety",
    facts: [
      ["긴 비밀번호는 짧은 비밀번호보다 추측하기 어려운 경우가 많다.", "A long password is often harder to guess than a short one."],
      ["서비스마다 다른 비밀번호를 쓰면 한 계정의 유출이 다른 계정으로 번지는 위험을 줄인다.", "Unique passwords reduce the risk that one breach spreads to other accounts."],
      ["다단계 인증은 비밀번호 외의 확인 단계를 추가한다.", "Multi-factor authentication adds a check beyond the password."],
      ["의심스러운 링크를 누르기 전에 보낸 사람과 주소를 확인해야 한다.", "Before opening a suspicious link, check the sender and address."],
      ["운영체제와 앱을 업데이트하면 알려진 보안 문제를 고칠 수 있다.", "Updating systems and apps can fix known security problems."],
      ["공개 게시물에는 주소나 연락처 같은 개인정보를 올리지 않는 편이 안전하다.", "It is safer not to post private details such as an address or phone number publicly."],
      ["백업은 기기가 고장 나거나 파일이 손상됐을 때 복구에 도움이 된다.", "Backups help recovery when a device fails or files are damaged."],
      ["온라인 정보는 여러 신뢰할 만한 출처와 비교해 확인해야 한다.", "Online information should be checked against several reliable sources."]
    ],
    wrong: [
      ["모든 사이트에서 같은 비밀번호를 쓰는 것이 가장 안전하다.", "Using the same password everywhere is the safest choice."],
      ["낯선 링크는 주소를 보지 않고 바로 눌러야 한다.", "Unknown links should be opened without checking their addresses."],
      ["소프트웨어 업데이트는 보안과 아무 관련이 없다.", "Software updates have nothing to do with security."],
      ["개인정보는 공개할수록 계정이 안전해진다.", "Publishing more private information makes an account safer."],
      ["온라인에서 본 정보는 출처와 상관없이 모두 사실이다.", "Everything online is true regardless of its source."]
    ]
  },
  {
    key: "SOC-DEMOCRATIC-DECISION",
    ko: "함께 결정하는 방법",
    en: "Making Decisions Together",
    facts: [
      ["공동의 결정에서는 서로 다른 의견을 들을 기회가 필요하다.", "A shared decision should give different views a chance to be heard."],
      ["주장의 근거를 확인하면 의견을 더 공정하게 비교할 수 있다.", "Checking evidence helps people compare claims more fairly."],
      ["다수결은 한 가지 결정 방법이지만 소수의 권리도 함께 고려해야 한다.", "Majority voting is one method, but minority rights still matter."],
      ["토론의 목적은 상대를 모욕하는 것이 아니라 쟁점을 검토하는 것이다.", "The purpose of discussion is to examine issues, not insult opponents."],
      ["결정 과정과 기준을 공개하면 책임성을 높일 수 있다.", "Sharing the process and criteria can increase accountability."],
      ["이해관계가 다른 사람들은 같은 정책의 영향을 다르게 받을 수 있다.", "People with different interests can be affected differently by one policy."],
      ["합의는 모든 차이를 없애기보다 함께 받아들일 수 있는 안을 찾는 과정이다.", "Consensus seeks an acceptable option rather than erasing every difference."],
      ["결정 뒤에도 결과를 살펴보고 필요하면 규칙을 고칠 수 있다.", "After a decision, people can review results and revise rules when needed."]
    ],
    wrong: [
      ["공동의 결정에서는 한 사람의 의견만 들으면 충분하다.", "A shared decision needs only one person's opinion."],
      ["근거가 없는 주장과 검증된 주장은 항상 같은 가치가 있다.", "Unsupported and well-tested claims always have equal value."],
      ["다수결 결과가 나오면 소수의 권리는 고려할 필요가 없다.", "After a majority vote, minority rights no longer matter."],
      ["토론에서는 상대를 모욕할수록 주장이 강해진다.", "Insults make an argument stronger in a discussion."],
      ["한 번 정한 규칙은 결과와 관계없이 절대 바꿀 수 없다.", "A rule can never be changed after it is adopted."]
    ]
  },
  {
    key: "MATH-RATIO",
    ko: "비와 비율",
    en: "Ratios and Rates",
    facts: [
      ["비는 두 양의 크기를 비교하는 방법이다.", "A ratio compares the sizes of two quantities."],
      ["2 대 3과 4 대 6은 같은 관계를 나타내는 동치비다.", "The ratios 2 to 3 and 4 to 6 describe the same relationship."],
      ["단위율은 비교하는 양 중 하나를 1로 놓고 나타낸 비율이다.", "A unit rate expresses a comparison for one unit."],
      ["전체가 달라지면 같은 개수라도 비율은 달라질 수 있다.", "The same count can represent a different fraction when the total changes."],
      ["비례 관계에서는 한 양이 일정한 배수가 되면 다른 양도 같은 배수가 된다.", "In a proportional relationship, scaling one quantity scales the other equally."],
      ["그래프가 원점을 지나는 직선이면 비례 관계를 나타낼 수 있다.", "A straight line through the origin can represent a proportional relationship."],
      ["백분율은 전체를 100으로 보았을 때의 비율이다.", "A percentage is a ratio expressed out of one hundred."],
      ["단위가 다른 비율을 비교할 때는 단위를 같게 맞춰야 한다.", "Rates with different units should be converted to matching units before comparison."]
    ],
    wrong: [
      ["비는 언제나 두 수를 더해서 구한다.", "A ratio is always found by adding two numbers."],
      ["2 대 3과 4 대 6은 서로 관계가 없는 비다.", "The ratios 2 to 3 and 4 to 6 are unrelated."],
      ["전체의 크기는 비율에 아무 영향도 주지 않는다.", "The size of the whole never affects a fraction."],
      ["비례 그래프는 반드시 원점을 지나지 않는다.", "A proportional graph must avoid the origin."],
      ["백분율은 전체를 10으로 보았을 때의 값이다.", "A percentage expresses a ratio out of ten."]
    ]
  },
  {
    key: "ART-LOOKING",
    ko: "작품을 보는 방법",
    en: "Looking at Art",
    facts: [
      ["작품 감상은 먼저 화면에서 실제로 보이는 것을 관찰하는 데서 시작할 수 있다.", "Art viewing can begin by observing what is actually visible."],
      ["색, 선, 형태, 질감은 작품을 설명할 때 살펴볼 수 있는 요소다.", "Color, line, shape, and texture are elements used to describe art."],
      ["같은 작품도 관람자의 경험에 따라 다르게 해석될 수 있다.", "The same artwork can be interpreted differently depending on a viewer's experience."],
      ["해석에는 작품에서 찾은 구체적인 근거를 덧붙이는 것이 좋다.", "An interpretation is stronger when supported by specific evidence from the artwork."],
      ["작품이 만들어진 시대와 장소는 의미를 이해하는 데 도움을 줄 수 있다.", "The time and place in which art was made can help explain its meaning."],
      ["작가의 의도는 중요한 정보지만 작품의 의미를 하나로만 고정하지는 않는다.", "An artist's intention matters but does not always fix a single meaning."],
      ["재료와 제작 방법은 작품이 주는 느낌에 영향을 줄 수 있다.", "Materials and techniques can influence the effect of an artwork."],
      ["감상에서는 관찰한 사실과 개인의 느낌을 구분해 말할 수 있다.", "In art discussion, viewers can distinguish observations from personal reactions."]
    ],
    wrong: [
      ["작품 감상에서는 실제로 보이는 것을 관찰할 필요가 없다.", "Art viewing does not require observing what is visible."],
      ["모든 관람자는 작품을 반드시 똑같이 해석해야 한다.", "Every viewer must interpret an artwork in exactly the same way."],
      ["해석에는 작품 속 근거가 전혀 필요하지 않다.", "An interpretation never needs evidence from the artwork."],
      ["작품의 재료는 느낌과 아무 관계가 없다.", "An artwork's material has no effect on its appearance."],
      ["개인의 느낌과 관찰한 사실은 항상 완전히 같다.", "A personal reaction is always identical to an observation."]
    ]
  }
];

function rotate(values, amount) {
  const offset = amount % values.length;
  return values.slice(offset).concat(values.slice(0, offset));
}

function buildItem(topic, track, level) {
  const languageIndex = track === "ko" ? 0 : 1;
  const factIndex = level - 1;
  const detailCount = level <= 2 ? 2 : level <= 5 ? 3 : 4;
  const facts = rotate(topic.facts, factIndex).slice(0, detailCount);
  const answer = topic.facts[factIndex][languageIndex];
  const choiceCount = level <= 2 ? 3 : level <= 4 ? 4 : 5;
  const distractors = rotate(topic.wrong, factIndex).slice(0, choiceCount - 1).map((pair) => pair[languageIndex]);
  const correctIndex = (level * 2 + topic.key.length) % choiceCount;
  const choices = distractors.slice();
  choices.splice(correctIndex, 0, answer);
  const isKorean = track === "ko";

  return {
    id: `${topic.key}-${isKorean ? "K" : "E"}${level}-V1`,
    topicTitle: isKorean ? topic.ko : topic.en,
    track,
    targetLevel: level,
    questionType: level <= 2 ? "explicit" : "content_match",
    passageText: facts.map((pair) => pair[languageIndex]).join(isKorean ? " " : " "),
    promptText: isKorean
      ? "윗글의 내용과 일치하는 것을 고르세요."
      : "Which statement agrees with the passage?",
    choices,
    correctIndex,
    explanation: isKorean
      ? `지문에 “${answer}”라고 제시되어 있습니다.`
      : `The passage states: “${answer}”`
  };
}

function createSelfStudyItems() {
  return TOPICS.flatMap((topic) => ["ko", "en"].flatMap((track) =>
    Array.from({ length: 8 }, (_, index) => buildItem(topic, track, index + 1))
  ));
}

module.exports = { createSelfStudyItems };
