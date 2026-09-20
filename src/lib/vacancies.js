export function vacancySummary(vacancy) {
  return [
    vacancy?.location || vacancy?.meta?.location,
    vacancy?.hours || vacancy?.meta?.hours,
    vacancy?.salary || vacancy?.meta?.salary,
  ]
    .filter((value) => typeof value === "string" && value.trim())
    .join(" · ");
}
