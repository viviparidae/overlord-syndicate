/**
 * StatusBar - DOM overlay UI for resource display
 * Read-only reflection of core state
 */
export class StatusBar {
  private element: HTMLElement;

  constructor(container: HTMLElement) {
    this.element = document.createElement("div");
    this.element.className = "status-bar";
    this.element.innerHTML = `
      <span class="resource funds">資金: ¥10,000</span>
      <span class="resource fear">恐怖: 0</span>
      <span class="resource faith">狂信: 0%</span>
      <span class="resource suspect">警戒度: 0%</span>
    `;
    container.appendChild(this.element);
  }

  update(resources: { funds: number; fear: number; faith: number; suspect: number }): void {
    const fundsEl = this.element.querySelector(".resource.funds") as HTMLElement;
    const fearEl = this.element.querySelector(".resource.fear") as HTMLElement;
    const faithEl = this.element.querySelector(".resource.faith") as HTMLElement;
    const suspectEl = this.element.querySelector(".resource.suspect") as HTMLElement;

    if (fundsEl) fundsEl.textContent = `資金: ¥${resources.funds.toLocaleString()}`;
    if (fearEl) fearEl.textContent = `恐怖: ${resources.fear}`;
    if (faithEl) faithEl.textContent = `狂信: ${resources.faith}%`;
    if (suspectEl) suspectEl.textContent = `警戒度: ${resources.suspect}%`;
  }

  destroy(): void {
    this.element.remove();
  }
}
