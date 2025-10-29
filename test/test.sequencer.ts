import Sequencer from '@jest/test-sequencer';

interface Test {
  context: any;
  path: string;
}

export default class CustomSequencer extends Sequencer {
  sort(tests: Test[]): Test[] {
    const order = ['auth.spec', 'llm.spec', 'prompt.spec'];

    return tests.sort((a, b) => {
      const aIndex = order.findIndex((key) => a.path.includes(key));
      const bIndex = order.findIndex((key) => b.path.includes(key));

      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });
  }
}
