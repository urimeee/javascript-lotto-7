import Lotto from "./Lotto.js";
import { Random, Console } from '@woowacourse/mission-utils';
import {
  LOTTO_PRICE,
  VALID_HIGHEST_NUM,
  VALID_LOWEST_NUM,
  VALID_LOTTERY_NUM,
  MAX_LIMIT
} from './constants/validate.js';

class LottoGame {
  #purchasePrice;
  #winNumbers;
  #bonusNumber;

  constructor() {
    this.#purchasePrice = 0;
    this.#winNumbers = [];
    this.#bonusNumber = 0;
  }

  #validateNumber(number) {
    if(Number.isNaN(number) || number < VALID_LOWEST_NUM || number > VALID_HIGHEST_NUM) {
      throw new Error('[ERROR] 1부터 45까지의 숫자만 입력해주세요.');
    }
  }

  #validateWinNumbers(winNumbers) {
    winNumbers.forEach(winNumber => {
      this.#validateNumber(winNumber);
    })
    if (winNumbers.length !== VALID_LOTTERY_NUM || new Set(winNumbers).size !== VALID_LOTTERY_NUM) {
      throw new Error('[ERROR] 중복되지 않는 수 6개를 입력해주세요.');
    }
  }

  #validateBonusNumber(bonusNumber) {
    const bonusNum = Number(bonusNumber);
    this.#validateNumber(bonusNum);

    if (this.#winNumbers.includes(bonusNumber)) {
      throw new Error('[ERROR] 보너스 번호는 당첨 번호와 중복될 수 없습니다.');
    }
  }

  #validatePurchasePrice(purchasePrice) {
    if (Number.isNaN(purchasePrice) || purchasePrice <= 0 || purchasePrice % LOTTO_PRICE !== 0) {
      throw new Error('[ERROR] 1000원 단위의 양수 금액을 입력해주세요.');
    }
    if (purchasePrice > MAX_LIMIT) {
      throw new Error(`[ERROR] 최대 구매 금액은 ${MAX_LIMIT}원입니다.`);
    }
  }

  generateLotto() {
    let lottos = [];
    for(let i = 0; i < this.calculateLottoCount(); i++) {
      lottos.push(new Lotto(Random.pickUniqueNumbersInRange(1, 45, 6)));
    }
    return lottos;
  }

  calculateLottoCount() {
    return this.#purchasePrice / LOTTO_PRICE;
  }

  buyLotto(purchasePrice) {
    this.#purchasePrice = purchasePrice;
    this.#validatePurchasePrice(purchasePrice);
    return Console.print(`\n${this.calculateLottoCount()}개를 구매했습니다.`);

  }

  setWinNumbers(winNumbers) {
    this.#validateWinNumbers(winNumbers);
    this.#winNumbers = winNumbers;
  }

  setBonusNumber(bonusNumber) {
    this.#validateBonusNumber(bonusNumber);
    this.#bonusNumber = bonusNumber;
  }

  checkWinning(userLotto) {
    const winNumbersArray = this.#winNumbers.map(Number).sort((a, b) => a - b);
    const result = {
      3: 0,
      4: 0,
      5: 0,
      '5+bonus': 0,
      6: 0
    }
    userLotto.forEach((lotto) => {
      const matchCount = this.#countMatches(lotto.getNumbers(), winNumbersArray);
      this.#updateResult(result, matchCount, this.#hasBonusNumber(lotto.getNumbers()));
    });
    return result;
  };

  #countMatches(userNumbers, winNumbers) {
    return winNumbers.filter((num) => userNumbers.includes(num)).length;
  }

  #hasBonusNumber(userNumbers) {
    return userNumbers.includes(Number(this.#bonusNumber));
  }

  #updateResult(result, matchCount, hasBonus) {
    if (matchCount ===6) result[6] += 1;
    else if (matchCount === 5 && hasBonus) result['5+bonus'] += 1;
    else if (matchCount > 2) result[matchCount] += 1;
  }

  calculateProfit(userLotto) {
    let result = this.checkWinning(userLotto);
    const totalEarnings = (5000 * result[3]) + (50000 * result[4]) + (1500000 * result[5]) + (30000000 * result['5+bonus']) + (2000000000 * result[6]);
    const investment = this.calculateLottoCount() * LOTTO_PRICE;
    const profitRate = ((totalEarnings / investment)*100).toFixed(1);
    return profitRate;
  }
}
export default LottoGame;
