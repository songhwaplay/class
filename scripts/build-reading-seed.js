"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "game-hub-server", "data", "reading-bank-seed-v1.json");

const configs = [
  {
    sourceFile: "수면과_기억_수직샘플_v0.1.md",
    topic: {
      topicKey: "SCI-SLEEP-MEMORY-001",
      title: "수면과 기억",
      primaryDomain: "science",
      relatedDomains: ["health_life"],
      coreQuestion: "잠은 학습과 기억에 어떤 방식으로 관여하는가?",
      coreFacts: [
        "잠은 학습과 새로운 기억 형성에 필요한 뇌 기능과 관련된다.",
        "학습 전의 수면 부족은 집중과 새로운 정보의 입력을 어렵게 할 수 있다.",
        "학습 후의 수면은 새로 형성된 기억을 안정시키고 재구성하는 공고화 과정에 관여한다.",
        "수면은 학습을 대신하지 않으며 먼저 정보를 학습해야 정리할 기억이 생긴다."
      ],
      misconceptions: ["잠자는 동안 강의를 틀어 놓으면 깨어서 공부하지 않아도 복잡한 내용을 배울 수 있다."],
      practicalUse: "공부 시간과 수면 시간을 단순한 경쟁 관계로 보지 않고 상호보완적인 학습 과정으로 이해한다.",
      ageScope: {
        lowerElementary: "잠든 동안 뇌가 배운 내용을 정리하는 데 도움을 준다는 구체적 설명",
        upperElementary: "학습 전의 집중과 학습 후의 기억 안정",
        middleSchool: "부호화·공고화·인출과 수면의 상호보완성",
        highSchool: "연구 방법의 한계와 기억 공고화 체계"
      },
      uncertaintyNotes: "수면의 효과는 기억의 종류, 발달 단계, 수면의 질과 시기, 연구 방법에 따라 달라질 수 있다.",
      status: "draft"
    },
    sources: [
      {
        title: "Understanding Sleep",
        publisher: "National Institute of Neurological Disorders and Stroke",
        sourceUrl: "https://www.ninds.nih.gov/sites/default/files/2025-05/understanding-sleep.pdf",
        sourceKind: "official",
        publishedOn: "2025-05-01",
        notes: "학습·기억 형성·집중과 수면의 관계에 관한 공식 안내"
      },
      {
        title: "Sleep and memory in healthy children and adolescents",
        publisher: "PubMed",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/20093053/",
        sourceKind: "systematic_review",
        publishedOn: "2010-06-01",
        notes: "아동·청소년의 수면과 기억 연구에 관한 비판적 검토"
      },
      {
        title: "Recent advances in memory consolidation and information processing during sleep",
        publisher: "PubMed",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/35403267/",
        sourceKind: "systematic_review",
        publishedOn: "2022-01-01",
        notes: "수면과 기억 공고화의 최근 연구 검토"
      }
    ],
    questionTypes: {
      K1: "explicit", K2: "inference", K3: "title", K4: "inference",
      K5: "main_idea", K6: "inference", K7: "inference", K8: "inference",
      E1: "explicit", E2: "explicit", E3: "main_idea", E4: "title",
      E5: "blank", E6: "order", E7: "inference", E8: "blank"
    }
  },
  {
    sourceFile: "평균의_함정_수직샘플_v0.1.md",
    topic: {
      topicKey: "MATH-CENTER-001",
      title: "평균의 함정",
      primaryDomain: "math_data",
      relatedDomains: ["society_economy", "science"],
      coreQuestion: "하나의 평균값은 자료 전체를 얼마나 잘 보여 주는가?",
      coreFacts: [
        "산술평균은 모든 값의 합을 자료 수로 나눈 값이며 모든 관측값을 계산에 사용한다.",
        "중앙값은 자료를 크기순으로 놓았을 때 가운데에 위치한 값이다.",
        "극단값은 산술평균을 크게 움직일 수 있지만 중앙값에는 상대적으로 작은 영향을 준다.",
        "평균과 중앙값 중 어떤 대표값이 적절한지는 자료의 분포와 질문에 달려 있다.",
        "평균이 같아도 자료의 퍼짐과 모양은 다를 수 있다.",
        "크기가 다른 집단의 평균을 합칠 때는 자료 수를 반영한 가중평균이 필요하다."
      ],
      misconceptions: ["평균은 언제나 대부분의 사람이 실제로 가진 값을 뜻한다."],
      practicalUse: "소득, 집값, 시험 점수, 이용 시간, 제품 후기에서 대표값과 분포를 함께 확인한다.",
      ageScope: {
        lowerElementary: "평균을 모두 모아 똑같이 나눈 값으로 이해",
        upperElementary: "극단값과 평균·중앙값의 차이",
        middleSchool: "대표값과 자료의 퍼짐을 함께 해석",
        highSchool: "가중평균과 집단 구성비 변화의 효과"
      },
      uncertaintyNotes: "실제 사회 집단의 수치는 출처와 조사 시점을 확인하고, 설명용 자료는 가상 자료로 구분한다.",
      status: "draft"
    },
    sources: [
      {
        title: "Histogram Interpretation: Skewed Right",
        publisher: "National Institute of Standards and Technology",
        sourceUrl: "https://www.itl.nist.gov/div898/handbook/eda/section3/eda33a6.htm",
        sourceKind: "official",
        notes: "비대칭 분포에서 평균·중앙값·최빈값의 차이에 관한 공식 안내"
      },
      {
        title: "Statistical Education of Teachers",
        publisher: "American Statistical Association",
        sourceUrl: "https://www.amstat.org/asa/files/pdfs/edu-set.pdf",
        sourceKind: "official",
        publishedOn: "2016-01-01",
        notes: "분포 형태에 따른 대표값 선택과 이상값에 강한 요약값 설명"
      },
      {
        title: "Statistics Education Web",
        publisher: "American Statistical Association",
        sourceUrl: "https://www.amstat.org/education/stew/statistics-education-web-%28stew%29",
        sourceKind: "official",
        notes: "통계적 질문·자료 수집·분석·맥락 속 해석을 연결하는 교육 자료"
      }
    ],
    questionTypes: {
      K1: "explicit", K2: "inference", K3: "inference", K4: "inference",
      K5: "main_idea", K6: "inference", K7: "data_interpretation", K8: "data_interpretation",
      E1: "explicit", E2: "explicit", E3: "inference", E4: "title",
      E5: "blank", E6: "order", E7: "inference", E8: "blank"
    }
  }
];

function splitSentences(value) {
  return String(value || "")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function distractorReasons(explanation, choiceCount, correctIndex) {
  const sentences = splitSentences(explanation);
  return Array.from({ length: choiceCount }, (_, index) => {
    if (index === correctIndex) return "";
    const number = String(index + 1);
    return sentences.find((sentence) => new RegExp(`(^|[^0-9])${number}(?:은|는|이|가|번|과|와|·|,)`).test(sentence)) || explanation;
  });
}

function parseSections(markdown, config) {
  const items = [];
  const sectionPattern = /^### ([KE])([1-8]) ·[^\r\n]*\r?\n([\s\S]*?)(?=^---\s*$)/gm;
  let match;

  while ((match = sectionPattern.exec(markdown))) {
    const code = `${match[1]}${match[2]}`;
    const body = match[3];
    const passageMatch = body.match(/\*\*(?:지문|Passage)\*\*\s*\r?\n+([\s\S]*?)\r?\n+\*\*(?:문제|Question)\*\*\s*([^\r\n]+)/);
    const answerMatch = body.match(/\*\*(?:정답|Answer):\*\*\s*([1-5])/);
    const explanationMatch = body.match(/\*\*해설:\*\*\s*([^\r\n]+)/);
    if (!passageMatch || !answerMatch || !explanationMatch) {
      throw new Error(`${config.sourceFile} ${code} 구역을 해석하지 못했습니다.`);
    }

    const questionStart = body.indexOf(passageMatch[0]) + passageMatch[0].length;
    const answerStart = body.indexOf(answerMatch[0]);
    const choiceBlock = body.slice(questionStart, answerStart);
    const choices = [...choiceBlock.matchAll(/^([1-5])\.\s+(.+)$/gm)].map((choice) => choice[2].trim());
    const correctIndex = Number(answerMatch[1]) - 1;
    const explanation = explanationMatch[1].trim();
    const expectedChoices = Number(match[2]) <= 2 ? 3 : Number(match[2]) <= 4 ? 4 : 5;
    if (choices.length !== expectedChoices) {
      throw new Error(`${config.sourceFile} ${code} 선지는 ${expectedChoices}개여야 하지만 ${choices.length}개입니다.`);
    }

    items.push({
      itemKey: `${config.topic.topicKey}-${code}-V1`,
      track: match[1] === "K" ? "ko" : "en",
      targetLevel: Number(match[2]),
      questionType: config.questionTypes[code],
      passageText: passageMatch[1].trim(),
      promptText: passageMatch[2].trim(),
      choices,
      correctIndex,
      answerEvidence: splitSentences(explanation)[0] || explanation,
      explanation,
      distractorReasons: distractorReasons(explanation, choices.length, correctIndex),
      difficultyMeta: {
        estimatedLevel: code,
        sourceDocument: config.sourceFile,
        sourceVersion: "v0.1"
      }
    });
  }

  if (items.length !== 16) throw new Error(`${config.sourceFile}에서 16문항 대신 ${items.length}문항을 찾았습니다.`);
  return items;
}

function build() {
  const topics = configs.map((config) => {
    const sourcePath = path.join(root, "outputs", config.sourceFile);
    const markdown = fs.readFileSync(sourcePath, "utf8");
    return {
      ...config.topic,
      sources: config.sources,
      items: parseSections(markdown, config)
    };
  });

  const seed = {
    schemaVersion: 1,
    sourceDocuments: configs.map((config) => config.sourceFile),
    topics
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
  console.log(`Reading seed: ${topics.length} topics, ${topics.reduce((sum, topic) => sum + topic.items.length, 0)} items`);
}

build();

