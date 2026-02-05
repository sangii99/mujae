const messages = [
  "당신의 이야기는 소중합니다. 용기 내어 공유해주셔서 감사합니다.",
  "혼자가 아니에요. 우리는 함께 있습니다.",
  "오늘 하루도 고생 많으셨어요. 당신은 충분히 잘하고 있어요.",
  "당신의 감정은 모두 소중하고 타당합니다.",
  "힘든 시간을 견뎌내는 당신이 자랑스럽습니다.",
  "작은 발걸음도 앞으로 나아가는 거예요.",
  "당신은 혼자가 아닙니다. 이곳에는 당신을 응원하는 사람들이 있어요.",
  "오늘도 최선을 다한 당신, 정말 멋져요.",
];

export function getRandomEncouragementMessage(): string {
  return messages[Math.floor(Math.random() * messages.length)];
}
