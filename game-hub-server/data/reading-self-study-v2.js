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
      ["구름은 공기 중 수증기가 더 뜨거워질 때 만들어진다.", "Clouds form when water vapor becomes warmer."],
      ["비가 내리면 물의 순환은 그 자리에서 끝난다.", "The water cycle ends whenever rain reaches the ground."],
      ["땅속으로 스며든 물은 강이나 바다로 이동할 수 없다.", "Water that enters the soil cannot move toward rivers or oceans."],
      ["식물은 뿌리로만 물을 내보내므로 대기 중 수증기와 관계없다.", "Plants release water only through roots, so they do not affect atmospheric vapor."],
      ["물의 순환은 바람이 만들며 태양 에너지는 필요하지 않다.", "Wind alone drives the water cycle, so solar energy is unnecessary."]
    ],
    applications: [
      ["햇볕에 널어 둔 젖은 수건의 물이 공기 중으로 이동할 수 있다.", "Water in a wet towel can move into the air when the towel is left in sunlight."],
      ["차가운 컵 표면에 물방울이 생기는 것은 기체 상태의 물이 식은 사례다.", "Droplets on a cold cup are an example of gaseous water cooling."],
      ["구름 속 작은 물방울이 합쳐져 충분히 무거워지면 지표로 떨어질 수 있다.", "Tiny cloud droplets can join and fall when they become heavy enough."],
      ["비가 그친 뒤에도 일부 물은 땅속에 남아 이동한다.", "After rain stops, some water remains underground and continues moving."],
      ["산에 내린 비가 하천을 거쳐 바다로 가는 것은 순환의 한 경로다.", "Rain moving from a mountain through a river to the sea is one path in the cycle."],
      ["숲이 대기 중 수증기의 양에 영향을 줄 수 있다.", "A forest can influence the amount of water vapor in the air."],
      ["한 물방울은 이동하면서 액체와 기체 상태를 오갈 수 있다.", "A drop of water can alternate between liquid and gas as it moves."],
      ["햇빛이 줄면 다른 조건이 같을 때 증발 속도도 느려질 수 있다.", "With other conditions unchanged, less sunlight can slow evaporation."]
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
      ["생산자는 다른 생물을 먹은 뒤에만 에너지를 얻을 수 있다.", "Producers obtain energy only after eating other organisms."],
      ["분해자가 줄어도 생태계의 물질 순환 속도는 달라지지 않는다.", "A decline in decomposers does not change the rate of matter cycling."],
      ["포식자의 수가 변해도 먹이가 되는 종의 수에는 영향이 없다.", "A change in predator numbers does not affect prey populations."],
      ["먹이와 물이 충분하면 공간은 서식지의 조건이 되지 않는다.", "If food and water are available, space is not a habitat requirement."],
      ["먹이 단계가 높아질수록 이용할 수 있는 에너지의 양이 커진다.", "More usable energy is available at each higher feeding level."]
    ],
    applications: [
      ["풀은 다른 생물을 먹지 않고도 먹이 관계의 출발점이 될 수 있다.", "Grass can begin a feeding relationship without eating another organism."],
      ["토양의 분해자가 줄면 낙엽이 분해되는 속도가 느려질 수 있다.", "Fewer soil decomposers can slow the breakdown of fallen leaves."],
      ["토끼를 먹는 여우의 수가 변하면 토끼 개체군도 영향을 받을 수 있다.", "A change in fox numbers can affect the rabbit population they feed on."],
      ["여러 먹이 사슬에 동시에 등장하는 생물이 있을 수 있다.", "One organism can appear in several food chains at the same time."],
      ["곤충 한 종이 크게 줄면 그 곤충을 먹는 새도 영향을 받을 수 있다.", "A sharp decline in one insect species can affect birds that eat it."],
      ["연못이 마르면 그곳에서 먹이와 물을 얻던 생물의 생활이 어려워진다.", "If a pond dries up, organisms that relied on it for food and water may struggle."],
      ["비슷한 역할을 하는 종이 여럿이면 한 종의 감소를 다른 종이 일부 보완할 수 있다.", "When several species fill similar roles, others may partly offset the loss of one."],
      ["같은 양의 먹이로는 초식동물보다 상위 포식자를 더 적게 지탱하게 된다.", "The same food base supports fewer top predators than herbivores."]
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
      ["이번 주의 기온만 알면 그 지역의 기후를 충분히 설명할 수 있다.", "One week of temperatures is enough to describe a region's climate."],
      ["평년보다 추운 하루가 나타나면 장기 기후 추세도 즉시 반대가 된다.", "One colder-than-average day immediately reverses a long-term climate trend."],
      ["두 지역의 평균 기온이 같으면 강수와 바람의 특징도 같다.", "Regions with the same mean temperature also have the same rainfall and wind."],
      ["해안과 내륙은 바다의 영향과 관계없이 같은 기온 변화를 보인다.", "Coastal and inland areas show the same temperature changes regardless of the ocean."],
      ["관측값이 충분하면 예보 모형 없이도 미래 날씨를 정확히 알 수 있다.", "Enough observations can predict future weather exactly without a model."]
    ],
    applications: [
      ["내일 우산이 필요한지 판단하려면 장기 평균보다 단기 예보가 더 직접적이다.", "A short-term forecast is more useful than a long-term average for deciding whether to carry an umbrella tomorrow."],
      ["한 도시의 계절적 특징을 알려면 여러 해의 기록을 살펴봐야 한다.", "To identify a city's seasonal pattern, records from many years should be examined."],
      ["한파가 하루 있었다는 사실만으로 수십 년의 변화 방향을 결론 내릴 수 없다.", "One day of extreme cold cannot establish the direction of change over decades."],
      ["기온이 같아도 비와 바람이 다르면 두 날의 날씨는 다르게 설명된다.", "Two days with equal temperatures can have different weather if rain and wind differ."],
      ["10년 자료보다 30년 자료가 지역 기후를 판단하는 데 일반적으로 더 적합하다.", "Thirty years of data generally describes regional climate better than ten years."],
      ["산의 양쪽 지역은 공기의 상승과 강수 차이 때문에 서로 다른 기후가 나타날 수 있다.", "Opposite sides of a mountain can have different climates because of rising air and rainfall."],
      ["새 관측 자료가 들어오면 예보 결과가 수정될 수 있다.", "A forecast may be revised when new observations become available."],
      ["평균 기온만 같은 두 지역이라도 폭염 위험은 다를 수 있다.", "Two regions with the same mean temperature can still have different heat-wave risks."]
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
      ["전구에 들어간 전기 에너지는 모두 빛으로만 전환된다.", "All electrical energy entering a lamp becomes light."],
      ["두 물체의 속력이 같으면 질량과 관계없이 운동 에너지도 같다.", "Objects moving at the same speed have equal kinetic energy regardless of mass."],
      ["높이가 같은 물체는 질량이 달라도 위치 에너지가 같다.", "Objects at the same height have equal potential energy even if their masses differ."],
      ["마찰로 생긴 열은 원래 운동 에너지와 별개의 에너지다.", "Heat from friction is unrelated to the original kinetic energy."],
      ["효율이 80%인 기계는 들어간 에너지의 80%가 사라진다는 뜻이다.", "An 80% efficient machine loses 80% of its input energy."]
    ],
    applications: [
      ["전구가 켜질 때 빛뿐 아니라 열도 생길 수 있다.", "A lamp can produce heat as well as light when switched on."],
      ["같은 물체가 더 빠르게 움직이면 운동과 관련된 에너지도 커진다.", "When the same object moves faster, its energy of motion increases."],
      ["책을 더 높은 선반으로 옮기면 위치와 관련된 에너지가 커질 수 있다.", "Moving a book to a higher shelf can increase its energy of position."],
      ["손전등은 배터리에 저장된 에너지를 이용해 전구에 전기를 공급한다.", "A flashlight uses stored battery energy to supply electricity to its lamp."],
      ["선풍기가 작동할 때 전기 에너지는 날개의 운동과 열 등으로 전환된다.", "When a fan runs, electrical energy changes into blade motion, heat, and other forms."],
      ["브레이크를 잡은 자전거 바퀴가 따뜻해지는 것은 에너지 전환의 결과다.", "A bicycle wheel warming under braking is evidence of an energy transformation."],
      ["빛이 약해지면 같은 태양 전지의 전기 생산량도 줄 수 있다.", "The same solar cell may produce less electricity when the light becomes weaker."],
      ["두 기계가 같은 일을 한다면 열로 덜 빠져나가는 쪽이 더 효율적일 수 있다.", "If two machines do the same work, the one losing less energy as heat may be more efficient."]
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
      ["긴 비밀번호 하나를 여러 서비스에 함께 쓰면 관리와 보안을 모두 높일 수 있다.", "One long password reused across services improves both convenience and security."],
      ["보낸 사람의 이름이 아는 사람과 같으면 링크 주소는 확인하지 않아도 된다.", "If the sender's name is familiar, there is no need to inspect a link address."],
      ["다단계 인증을 켜면 비밀번호가 유출되어도 추가 확인 없이 로그인된다.", "With multi-factor authentication, a leaked password allows login without another check."],
      ["파일을 클라우드에 저장하면 별도의 백업은 고려할 필요가 없다.", "Saving files in the cloud removes any need to consider backups."],
      ["검색 결과의 맨 위에 표시된 정보가 가장 신뢰할 만하다.", "The first search result is necessarily the most reliable source."]
    ],
    applications: [
      ["비밀번호의 길이를 늘리면 가능한 조합이 많아져 추측이 더 어려워질 수 있다.", "Increasing password length can create more possible combinations and make guessing harder."],
      ["한 사이트의 비밀번호가 새어도 다른 사이트의 비밀번호가 다르면 피해 확산을 줄일 수 있다.", "If passwords differ, a breach at one site is less likely to spread to other accounts."],
      ["비밀번호를 알아낸 공격자도 추가 인증 수단이 없으면 로그인이 막힐 수 있다.", "An attacker with the password may still be blocked without the second authentication factor."],
      ["친구 이름으로 온 메시지도 링크 주소가 이상하면 다른 방법으로 본인에게 확인하는 편이 안전하다.", "Even a message using a friend's name should be verified another way if its link looks unusual."],
      ["보안 수정이 포함된 업데이트를 미루면 알려진 취약점이 남을 수 있다.", "Delaying an update with security fixes can leave a known vulnerability open."],
      ["공개 사진의 명찰이나 배경도 개인정보를 드러낼 수 있다.", "A name tag or background in a public photo can reveal private information."],
      ["원본과 분리된 백업이 있으면 파일 손상 뒤 복구 가능성이 높아진다.", "A separate backup improves the chance of recovery after file damage."],
      ["같은 주장을 독립적인 여러 기관이 뒷받침하는지 확인할 필요가 있다.", "A claim should be checked for support from several independent sources."]
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
      ["참여자가 많으면 서로 다른 의견을 듣는 절차는 생략해도 된다.", "When many people participate, procedures for hearing different views can be skipped."],
      ["모든 의견을 공정하게 다루려면 근거의 신뢰도 차이는 비교하지 않아야 한다.", "Fairness requires ignoring differences in the reliability of evidence."],
      ["과반수의 찬성을 얻은 결정은 기본권에 미치는 영향을 따로 검토하지 않아도 된다.", "A majority decision needs no separate review of its effect on basic rights."],
      ["토론에서 상대의 동기를 비판하면 제시된 근거도 자동으로 반박된다.", "Criticizing a speaker's motive automatically refutes the evidence presented."],
      ["결정 절차가 공개되면 결과를 다시 평가할 필요는 줄어든다.", "A transparent process reduces the need to evaluate later outcomes."]
    ],
    applications: [
      ["회의에서 발언 기회를 고르게 주는 것은 의견 수렴의 공정성을 높일 수 있다.", "Giving balanced speaking opportunities can make consultation fairer."],
      ["두 제안의 효과를 비교할 때는 각 주장이 어떤 자료에 근거하는지 살펴봐야 한다.", "Comparing proposals requires examining the evidence behind each claim."],
      ["표결에서 이긴 안이라도 특정 집단의 기본권을 침해하는지는 검토해야 한다.", "Even a winning proposal should be checked for harm to a group's basic rights."],
      ["사람이 아니라 그 사람이 제시한 주장과 근거를 비판하는 것이 토론 목적에 맞다.", "Discussion should criticize claims and evidence rather than the person presenting them."],
      ["선정 기준과 회의 기록을 공개하면 결정한 사람에게 이유를 물을 수 있다.", "Publishing criteria and meeting records makes decision-makers answerable for their reasons."],
      ["통학로 변경은 보행 학생과 차량 이용자에게 서로 다른 영향을 줄 수 있다.", "A school-route change can affect walkers and drivers differently."],
      ["모두가 가장 좋아하지는 않아도 받아들일 수 있는 안을 찾는 것이 합의가 될 수 있다.", "Consensus can be an option everyone accepts even if it is nobody's favorite."],
      ["새 규칙의 부작용이 확인되면 시행 결과를 근거로 수정할 수 있다.", "If a new rule has harmful effects, its results can justify revision."]
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
      ["비의 앞항과 뒷항의 순서를 바꾸어도 나타내는 비교는 같다.", "Reversing the two terms of a ratio preserves the same comparison."],
      ["동치비를 만들 때는 두 항에 서로 다른 수를 곱해도 된다.", "Equivalent ratios can be made by multiplying the two terms by different numbers."],
      ["전체가 커지면 부분의 수가 같아도 그 부분의 비율은 커진다.", "When the whole grows and the part stays fixed, the part's fraction increases."],
      ["두 양이 일정한 차이로 늘어나면 반드시 비례 관계다.", "Two quantities are proportional whenever they increase by a constant difference."],
      ["50%는 전체의 크기와 관계없이 항상 수량 50을 뜻한다.", "Fifty percent always means a quantity of 50 regardless of the whole."]
    ],
    applications: [
      ["빨간 공 2개와 파란 공 5개를 비교하면 빨강 대 파랑의 비는 2 대 5다.", "With 2 red balls and 5 blue balls, the ratio of red to blue is 2 to 5."],
      ["2 대 3의 두 항에 같은 수 2를 곱하면 4 대 6이 된다.", "Multiplying both terms of 2 to 3 by 2 gives 4 to 6."],
      ["180킬로미터를 3시간에 갔다면 한 시간당 거리는 60킬로미터다.", "Traveling 180 kilometers in 3 hours gives a unit rate of 60 kilometers per hour."],
      ["5명 중 2명과 10명 중 2명은 사람 수가 같아도 차지하는 비율은 다르다.", "Two out of five and two out of ten use the same count but represent different fractions."],
      ["재료를 모두 3배로 늘리면 비례하는 조리법의 맛의 비율은 유지된다.", "Tripling every ingredient preserves the ratios in a proportional recipe."],
      ["거리와 시간이 비례하고 시작 거리가 0이라면 그래프는 원점을 지난다.", "If distance is proportional to time and starts at zero, its graph passes through the origin."],
      ["학생 200명의 25%는 전체를 네 등분한 한 부분인 50명이다.", "Twenty-five percent of 200 students is one quarter, or 50 students."],
      ["시속과 분속을 바로 비교하려면 먼저 시간 단위를 맞춰야 한다.", "Hourly and per-minute rates must use matching time units before comparison."]
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
      ["작품의 의미를 먼저 정한 뒤 그 의미와 맞는 부분만 관찰하는 것이 좋다.", "Viewers should decide the meaning first and observe only details that support it."],
      ["색과 선을 정확히 나열하면 작품의 해석도 하나로 결정된다.", "Listing colors and lines accurately produces one fixed interpretation."],
      ["작가의 의도를 알면 시대와 관람자의 경험은 해석에 영향을 주지 않는다.", "Knowing the artist's intention removes the influence of history and viewer experience."],
      ["같은 형태의 작품은 재료가 달라도 같은 느낌을 준다.", "Works with the same shape create the same effect even when materials differ."],
      ["강한 감정을 느꼈다면 작품 속 근거를 따로 말할 필요가 없다.", "A strong emotional reaction needs no supporting detail from the artwork."]
    ],
    applications: [
      ["그림에 파란색 곡선이 반복된다는 말은 해석보다 관찰에 가깝다.", "Saying that blue curves repeat in a painting is closer to observation than interpretation."],
      ["두꺼운 직선과 거친 질감에 주목하면 작품의 긴장감을 설명할 근거를 찾을 수 있다.", "Thick straight lines and rough texture can support an interpretation of tension."],
      ["관람 경험이 다른 두 사람이 같은 그림에서 서로 다른 의미를 찾을 수 있다.", "Two viewers with different experiences can find different meanings in the same painting."],
      ["‘불안해 보인다’고 해석했다면 불규칙한 선 같은 시각적 근거를 함께 제시할 수 있다.", "An interpretation of anxiety can be supported by visual evidence such as irregular lines."],
      ["전쟁 시기에 제작됐다는 정보는 작품 속 상징을 이해하는 단서가 될 수 있다.", "Knowing a work was made during wartime can help explain its symbols."],
      ["작가의 설명을 알아도 작품에서 다른 근거를 찾은 관람자는 추가 해석을 제시할 수 있다.", "Even with the artist's statement, a viewer may offer another evidence-based interpretation."],
      ["같은 형상도 돌로 만들 때와 천으로 만들 때 무게감이 다르게 느껴질 수 있다.", "The same form can feel heavier in stone than in fabric."],
      ["‘화면 중앙에 인물이 있다’와 ‘외로워 보인다’는 서로 다른 종류의 진술이다.", "‘A figure is centered’ and ‘the figure seems lonely’ are different kinds of statements."]
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
  const answer = topic.applications[factIndex][languageIndex];
  const evidence = topic.facts[factIndex][languageIndex];
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
      ? `“${evidence}”라는 내용을 적용하면 판단할 수 있습니다.`
      : `This follows by applying the statement: “${evidence}”`
  };
}

function createSelfStudyItems() {
  return TOPICS.flatMap((topic) => ["ko", "en"].flatMap((track) =>
    Array.from({ length: 8 }, (_, index) => buildItem(topic, track, index + 1))
  ));
}

module.exports = { createSelfStudyItems };
