import { LinkedList } from '../lib/linked_list';
import { IllegalStateException } from '../lib/error';

describe('LinkedList', () => {
  const empty = Symbol.for('rs:empty');

  const rolling = (list, expected) => {
    const n = list.maxLength * 2;
    const m = expected.length;
    let cursor = list.head;
    for (let i = 0; i < n; ++i) {
      expect(cursor.value).toEqual(expected[i % m]);
      cursor = cursor.next;
    }
    cursor = list.head.prev;
    for (let i = n - 1; i >= 0; --i) {
      expect(cursor.value).toEqual(expected[i % m]);
      cursor = cursor.prev;
    }
  };

  it('should create a list of fixed size', () => {
    const list = new LinkedList(10);

    let cursor = list.head;
    for (let i = 0; i < 10; ++i) {
      cursor = cursor.next;
    }
    expect(cursor).toEqual(list.head);
    cursor = list.tail;
    for (let i = 0; i < 10; ++i) {
      cursor = cursor.prev;
    }
    expect(cursor).toEqual(list.tail);
    expect(list.head.prev).toEqual(list.tail);
    expect(list.maxLength).toEqual(10);
  });

  describe('push', () => {
    it('should push a value', () => {
      const list = new LinkedList(5);
      list.push(1);
      rolling(list, [1, empty, empty, empty, empty]);
    });

    it('should return a node', () => {
      const list = new LinkedList(10);
      let n = list.push(1);
      expect(n).toEqual(list.head);
      n = list.push(2);
      expect(n).toEqual(list.tail);
      expect(n).toEqual(list.head.next);
    });

    it('should prevent push into a full list', () => {
      const list = new LinkedList(10);
      for (let i = 0; i < 10; ++i) {
        list.push(1);
      }
      expect(() => list.push(1)).toThrow(new IllegalStateException('Full'));
    });
  });

  describe('pop', () => {
    it('should pop a value', () => {
      const list = new LinkedList(5);
      list.push(1);
      const val = list.pop();
      expect(val).toEqual(1);
      rolling(list, [empty, empty, empty, empty, empty]);
    });

    it('should return undefined if the the list is empty', () => {
      const list = new LinkedList(10);
      expect(list.pop()).toBeUndefined();
    });
  });

  it('the length should be zero', () => {
    const list = new LinkedList(10);
    expect(list.length).toEqual(0);
  });

  it('should change the length', () => {
    const list = new LinkedList(10);
    list.push(1);
    expect(list.length).toEqual(1);
    list.pop();
    expect(list.length).toEqual(0);
  });

  it('should indicate the emptiness of a list', () => {
    const list = new LinkedList(10);
    expect(list.empty).toBeTruthy();
    list.push(1);
    expect(list.empty).toBeFalsy();
    list.pop();
    expect(list.empty).toBeTruthy();
  });

  it('should indicate the fullness of a list', () => {
    const list = new LinkedList(10);
    expect(list.full).toBeFalsy();
    for (let i = 0; i < 10; ++i) {
      list.push(1);
    }
    expect(list.full).toBeTruthy();
    list.pop();
    expect(list.full).toBeFalsy();
  });

  describe('shift', () => {
    it('should shift', () => {
      const list = new LinkedList(5);
      list.push(1);
      list.push(2);
      list.push(3);
      list.push(4);
      expect(list.shift()).toEqual(1);
      expect(list.length).toEqual(3);
      rolling(list, [2, 3, 4, empty, empty]);
    });

    it('should return undefined if the list is empty', () => {
      const list = new LinkedList(10);
      expect(list.shift()).toBeUndefined();
    });
  });

  describe('unshift', () => {
    it('should unshift', () => {
      const list = new LinkedList(5);
      list.push(1);
      list.push(2);
      list.unshift(0);
      expect(list.length).toEqual(3);
      rolling(list, [0, 1, 2, empty, empty]);
    });

    it('should unshift into an empty list', () => {
      const list = new LinkedList(5);
      list.unshift(0);
      expect(list.length).toEqual(1);
      rolling(list, [0, empty, empty, empty, empty]);
    });

    it('should prevent unshifting into a full list', () => {
      const list = new LinkedList(10);
      for (let i = 0; i < 10; ++i) {
        list.push(1);
      }
      expect(() => list.unshift(0)).toThrow(new IllegalStateException('Full'));
    });
  });

  describe('pushNode', () => {
    it('should move a node to the tail', () => {
      const list = new LinkedList(5);
      list.push(1);
      const n = list.push(2);
      list.push(3);
      list.push(4);
      list.pushNode(n);
      expect(list.length).toEqual(4);
      rolling(list, [1, 3, 4, 2, empty]);
    });

    it('should be correct if the head is moved', () => {
      const list = new LinkedList(5);
      const n = list.push(1);
      list.push(2);
      list.push(3);
      list.pushNode(n);
      expect(list.length).toEqual(3);
      rolling(list, [2, 3, 1, empty, empty]);
    });

    it('should be correct if the tail is moved', () => {
      const list = new LinkedList(5);
      list.push(1);
      list.push(2);
      const n = list.push(3);
      list.pushNode(n);
      expect(list.length).toEqual(3);
      rolling(list, [1, 2, 3, empty, empty]);
    });
  });

  describe('unshiftNode', () => {
    it('should move a node to the head', () => {
      const list = new LinkedList(5);
      list.push(1);
      const n = list.push(2);
      list.push(3);
      list.unshiftNode(n);
      expect(list.length).toEqual(3);
      rolling(list, [2, 1, 3, empty, empty]);
    });

    it('should be correct if the head is moved', () => {
      const list = new LinkedList(5);
      const n = list.push(1);
      list.push(2);
      list.push(3);
      list.unshiftNode(n);
      expect(list.length).toEqual(3);
      rolling(list, [1, 2, 3, empty, empty]);
    });

    it('should be correct if the tail is moved', () => {
      const list = new LinkedList(5);
      list.push(1);
      list.push(2);
      const n = list.push(3);
      list.unshiftNode(n);
      expect(list.length).toEqual(3);
      rolling(list, [3, 1, 2, empty, empty]);
    });
  });

  describe('removeNode', () => {
    it('should remove a node', () => {
      const list = new LinkedList(5);
      list.push(1);
      const n = list.push(2);
      list.push(3);
      list.removeNode(n);
      expect(list.length).toEqual(2);
      rolling(list, [1, 3, empty, empty, empty]);
    });

    it('should be correct if the head is removed', () => {
      const list = new LinkedList(5);
      const n = list.push(1);
      list.push(2);
      list.push(3);
      list.removeNode(n);
      expect(list.length).toEqual(2);
      rolling(list, [2, 3, empty, empty, empty]);
    });

    it('should be correct if the tail is removed', () => {
      const list = new LinkedList(5);
      list.push(1);
      list.push(2);
      const n = list.push(3);
      list.removeNode(n);
      expect(list.length).toEqual(2);
      rolling(list, [1, 2, empty, empty, empty]);
    });
  });

  describe('clear', () => {
    it('should clear a list, but keeping the old values', () => {
      const list = new LinkedList(5);
      list.push(1);
      list.push(2);
      list.push(3);
      list.clear();
      expect(list.length).toEqual(0);
      expect(list.head).toEqual(list.tail.next);
      expect(list.head.prev).toEqual(list.tail);
      rolling(list, [1, 2, 3, empty, empty]);
    });

    it('should clear a list and pop all the values', () => {
      const list = new LinkedList(5);
      list.push(1);
      list.push(2);
      list.push(3);
      list.clear(true);
      expect(list.length).toEqual(0);
      expect(list.head).toEqual(list.tail.next);
      expect(list.head.prev).toEqual(list.tail);
      rolling(list, [empty, empty, empty, empty, empty]);
    });
  });

  it('should return an array from a list', () => {
    const list = new LinkedList(5);
    let a = list.toArray();
    expect(a).toBeInstanceOf(Array);
    expect(a).toEqual([]);
    list.push(1);
    list.push(2);
    list.push(3);
    expect(a).toEqual([]);
    a = list.toArray();
    expect(a).toBeInstanceOf(Array);
    expect(a).toStrictEqual([1, 2, 3]);
  });

  it('should provide an iterator', () => {
    const list = new LinkedList(5);
    expect(list[Symbol.iterator]).toBeInstanceOf(Function);
    for (const a of list) {
      throw new Error('it should be empty');
    }
    list.push(1);
    for (const a of list) {
      expect(a).toEqual(1);
    }
    list.push(2);
    const expected = [1, 2];
    for (const a of list) {
      expect(a).toEqual(expected.shift());
    }
  });

  describe('resizing', () => {
    it('should resize a list', () => {
      const list = new LinkedList(5);
      list.push(1);
      list.push(2);
      list.push(3);
      list.resize(8);
      expect(list.length).toEqual(3);
      expect(list.maxLength).toEqual(8);
      rolling(list, [1, 2, 3, empty, empty, empty, empty, empty]);
    });

    it('should work if the size is lower than the max but greater than the length', () => {
      const list = new LinkedList(5);
      list.push(1);
      list.push(2);
      list.push(3);
      list.resize(4);
      expect(list.front).toEqual(1);
      expect(list.back).toEqual(3);
      expect(list.length).toEqual(3);
      expect(list.maxLength).toEqual(4);
      rolling(list, [1, 2, 3, empty]);
    });

    it('should work if the size is lower than the max and lower than the length', () => {
      const list = new LinkedList(5);
      list.push(1);
      list.push(2);
      list.push(3);
      expect(list.length).toEqual(3);
      list.resize(2);
      expect(list.front).toEqual(1);
      expect(list.back).toEqual(2);
      expect(list.length).toEqual(2);
      expect(list.maxLength).toEqual(2);
      rolling(list, [1, 2]);
    });

    it('should work if the size is lower than the max and equal to the length', () => {
      const list = new LinkedList(5);
      list.push(1);
      list.push(2);
      list.push(3);
      list.resize(3);
      expect(list.front).toEqual(1);
      expect(list.back).toEqual(3);
      expect(list.length).toEqual(3);
      expect(list.maxLength).toEqual(3);
      rolling(list, [1, 2, 3]);
    });

    it('should work if actually there is no resizing', () => {
      const list = new LinkedList(5);
      list.push(1);
      list.push(2);
      list.push(3);
      list.resize(5);
      expect(list.front).toEqual(1);
      expect(list.back).toEqual(3);
      expect(list.length).toEqual(3);
      expect(list.maxLength).toEqual(5);
      rolling(list, [1, 2, 3, empty, empty]);
    });

    describe('autoresize', () => {
      it('should do autoresizing if the size is not provided', () => {
        const list = new LinkedList();
        expect(list.maxLength).toEqual(16); // the default value
        for (let i = 0; i < 16; ++i) {
          list.push(i);
        }
        expect(list.full).toBeTruthy();
        list.push(16);
        expect(list.length).toEqual(17);
        expect(list.maxLength).toEqual(32); // x2
        rolling(
          list,
          [...new Array(list.maxLength)].map((_, i) => (i > 16 ? empty : i)),
        );
        for (let i = 0; i < 15; ++i) {
          list.push(17 + i);
        }
        expect(list.full).toBeTruthy();
        list.push(32);
        expect(list.length).toEqual(33);
        expect(list.maxLength).toEqual(64); // x2
        rolling(
          list,
          [...new Array(list.maxLength)].map((_, i) => (i > 32 ? empty : i)),
        );
      });

      describe('pop', () => {
        it('should resize when length < maxLength / 2', () => {
          const list = new LinkedList();
          for (let i = 0; i < 100; ++i) {
            list.push(i);
          }
          expect(list.maxLength).toEqual(128);
          while (list.length > 64) {
            list.pop();
          }
          expect(list.maxLength).toEqual(128);
          list.pop();
          expect(list.maxLength).toEqual(64);
        });

        it(`should stop resizing when length < DEFAULT_LENGTH = ${LinkedList.DEFAULT_LENGTH}`, () => {
          const list = new LinkedList();
          for (let i = 0; i < 100; ++i) {
            list.push(i);
          }
          expect(list.maxLength).toEqual(128);
          while (list.length > LinkedList.DEFAULT_LENGTH) {
            list.pop();
          }
          expect(list.maxLength).toEqual(LinkedList.DEFAULT_LENGTH * 2);
          list.pop();
          expect(list.maxLength).toEqual(LinkedList.DEFAULT_LENGTH);
          while (!list.empty) {
            list.pop();
          }
          expect(list.maxLength).toEqual(LinkedList.DEFAULT_LENGTH);
        });

        it('should do nothing if autoresize is disabled', () => {
          const list = new LinkedList(128);
          for (let i = 0; i < 100; ++i) {
            list.push(i);
          }
          expect(list.maxLength).toEqual(128);
          while (list.length > LinkedList.DEFAULT_LENGTH) {
            list.pop();
          }
          expect(list.maxLength).toEqual(128);
          list.pop();
          expect(list.maxLength).toEqual(128);
          while (!list.empty) {
            list.pop();
          }
          expect(list.maxLength).toEqual(128);
        });
      });

      describe('shift', () => {
        it('should resize when length < maxLength / 2', () => {
          const list = new LinkedList();
          for (let i = 0; i < 100; ++i) {
            list.push(i);
          }
          expect(list.maxLength).toEqual(128);
          while (list.length > 64) {
            list.shift();
          }
          expect(list.maxLength).toEqual(128);
          list.shift();
          expect(list.maxLength).toEqual(64);
        });

        it('should stop resizing when length < DEFAULT_LENGTH', () => {
          const list = new LinkedList();
          for (let i = 0; i < 100; ++i) {
            list.push(i);
          }
          expect(list.maxLength).toEqual(128);
          while (list.length > LinkedList.DEFAULT_LENGTH) {
            list.shift();
          }
          expect(list.maxLength).toEqual(LinkedList.DEFAULT_LENGTH * 2);
          list.shift();
          expect(list.maxLength).toEqual(LinkedList.DEFAULT_LENGTH);
          while (!list.empty) {
            list.shift();
          }
          expect(list.maxLength).toEqual(LinkedList.DEFAULT_LENGTH);
        });

        it('should do nothing if autoresize is disabled', () => {
          const list = new LinkedList(128);
          for (let i = 0; i < 100; ++i) {
            list.push(i);
          }
          expect(list.maxLength).toEqual(128);
          while (list.length > LinkedList.DEFAULT_LENGTH) {
            list.shift();
          }
          expect(list.maxLength).toEqual(128);
          list.shift();
          expect(list.maxLength).toEqual(128);
          while (!list.empty) {
            list.shift();
          }
          expect(list.maxLength).toEqual(128);
        });
      });

      describe('removeNode', () => {
        it('should resize when the tail node is removed', () => {
          const tailNodes: any[] = [];
          const list = new LinkedList();
          for (let i = 0; i < 100; ++i) {
            tailNodes.push(list.push(i));
          }
          expect(list.maxLength).toEqual(128);
          while (list.length > 64) {
            list.removeNode(tailNodes.pop());
          }
          expect(list.maxLength).toEqual(128);
          list.removeNode(tailNodes.pop());
          expect(list.maxLength).toEqual(64);
        });

        it('should do nothing if autoresize is disabled', () => {
          const tailNodes: any[] = [];
          const list = new LinkedList(128);
          for (let i = 0; i < 100; ++i) {
            tailNodes.push(list.push(i));
          }
          expect(list.maxLength).toEqual(128);
          while (list.length > 64) {
            list.removeNode(tailNodes.pop());
          }
          expect(list.maxLength).toEqual(128);
          list.removeNode(tailNodes.pop());
          expect(list.maxLength).toEqual(128);
        });
      });

      describe('clear', () => {
        it('should set maxLength to DEFAULT_LENGTH', () => {
          const list = new LinkedList();
          for (let i = 0; i < 100; ++i) {
            list.push(i);
          }
          expect(list.maxLength).toEqual(128);
          list.clear();
          expect(list.maxLength).toEqual(LinkedList.DEFAULT_LENGTH);
        });

        it('should do nothing if autoresize is disabled', () => {
          const list = new LinkedList(128);
          for (let i = 0; i < 100; ++i) {
            list.push(i);
          }
          expect(list.maxLength).toEqual(128);
          list.clear();
          expect(list.maxLength).toEqual(128);
        });
      });
    });
  });

  describe('front', () => {
    it('should get the head', () => {
      const list = new LinkedList();
      list.push(1);
      expect(list.front).toEqual(1);
      list.push(2);
      expect(list.front).toEqual(1);
    });

    it('should throw an error if the list is empty', () => {
      const list = new LinkedList();
      expect(() => list.front).toThrow();
    });
  });

  describe('back', () => {
    it('should get the last element', () => {
      const list = new LinkedList();
      list.push(1);
      expect(list.back).toEqual(1);
      list.push(2);
      expect(list.back).toEqual(2);
    });

    it('should throw an error if the list is empty', () => {
      const list = new LinkedList();
      expect(() => list.back).toThrow();
    });
  });

  describe('nextNode', () => {
    it('should return the next node', () => {
      const list = new LinkedList();
      const a = list.push(1);
      const b = list.push(2);
      const c = list.push(3);
      expect(list.nextNode(a)).toEqual(b);
      expect(list.nextNode(b)).toEqual(c);
    });

    it('should return the first node without any argument', () => {
      const list = new LinkedList();
      const a = list.push(1);
      expect(list.nextNode()).toEqual(a);
    });

    it('should return null if this is the end', () => {
      const list = new LinkedList();
      list.push(1);
      const b = list.push(2);
      expect(list.nextNode(b)).toBeNull();
    });

    it('should return null there are no elements', () => {
      const list = new LinkedList();
      expect(list.nextNode()).toBeNull();
    });
  });

  describe('forEach', () => {
    it('should invoke a callback for each element', () => {
      const t: any[] = [];
      const a = new LinkedList();
      a.push(1);
      a.push(2);
      a.push(3);
      a.forEach((e) => t.push(e));
      expect(t).toStrictEqual([1, 2, 3]);
    });

    it('should pass the index as the second argument', () => {
      const t: any[] = [];
      const a = new LinkedList();
      a.push(1);
      a.push(2);
      a.push(3);
      a.forEach((...args) => t.push(args));
      expect(t).toStrictEqual([
        [1, 0],
        [2, 1],
        [3, 2],
      ]);
    });

    it('should not call the callback for an empty list', () => {
      const s = jest.fn();
      new LinkedList().forEach(s);
      expect(s.mock.calls.length).toEqual(0);
    });

    it('should stop iterating if the given function returns false', () => {
      const t: any[] = [];
      const a = new LinkedList();
      a.push(1);
      a.push(2);
      a.push(3);
      a.push(4);
      a.push(5);
      a.forEach((e) => {
        t.push(e);
        return e !== 2;
      });
      expect(t).toStrictEqual([1, 2]);
    });

    it('should not stop iterating if the given function returns falsy value but not false', () => {
      const t: any[] = [];
      const a = new LinkedList();
      a.push(1);
      a.push(2);
      a.push(3);
      a.push(4);
      a.push(5);
      a.push(6);
      a.push(7);
      const returnValues = [null, undefined, 0, '', false];
      a.forEach((e) => {
        t.push(e);
        return returnValues.shift();
      });
      expect(t).toStrictEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('map', () => {
    it('should map a list', () => {
      const a = new LinkedList();
      a.push(1);
      a.push(2);
      a.push(3);
      expect(a.map((e) => e + 1).toArray()).toStrictEqual([2, 3, 4]);
    });

    it('should pass the index as the second element', () => {
      const a = new LinkedList();
      a.push(1);
      a.push(2);
      a.push(3);
      let i = 0;
      const b = a.map((e, idx) => {
        expect(idx).toEqual(i++);
        return e + 1;
      });
      expect(b.toArray()).toStrictEqual([2, 3, 4]);
      expect(i).toEqual(3);
    });

    it('should not call the callback for an empty list', () => {
      const s = jest.fn();
      new LinkedList().map(s);
      expect(s.mock.calls.length).toEqual(0);
    });
  });

  describe('iterator', () => {
    describe('remove', () => {
      it('should remove node from the front', () => {
        const a = new LinkedList();
        a.push(1);
        a.push(2);
        a.push(3);
        a.push(4);
        a.push(5);
        const it = a[Symbol.iterator]();
        const v = it.next();
        expect(v.value).toEqual(1);
        it.remove();
        expect([...a]).toStrictEqual([2, 3, 4, 5]);
      });

      it('should remove node from the middle', () => {
        const a = new LinkedList();
        a.push(1);
        a.push(2);
        a.push(3);
        a.push(4);
        a.push(5);
        const it = a[Symbol.iterator]();
        let v = it.next();
        expect(v.value).toEqual(1);
        v = it.next();
        expect(v.value).toEqual(2);
        v = it.next();
        expect(v.value).toEqual(3);
        it.remove();
        expect([...a]).toStrictEqual([1, 2, 4, 5]);
      });

      it('should remove node from the back', () => {
        const a = new LinkedList();
        a.push(1);
        a.push(2);
        a.push(3);
        a.push(4);
        a.push(5);
        const it = a[Symbol.iterator]();
        it.next();
        it.next();
        it.next();
        it.next();
        const v = it.next();
        expect(v.value).toEqual(5);
        it.remove();
        expect([...a]).toStrictEqual([1, 2, 3, 4]);
      });
    });

    describe('reset', () => {
      it('should reset the iterator', () => {
        const a = new LinkedList();
        a.push(1);
        a.push(2);
        a.push(3);
        a.push(4);
        a.push(5);
        const it = a[Symbol.iterator]();
        it.next();
        it.next();
        expect(it.next().value).toEqual(3);
        it.reset();
        expect(it.next().value).toEqual(1);
        it.next();
        it.next();
        it.next();
        expect(it.next().value).toEqual(5);
        it.reset();
        expect(it.next().value).toEqual(1);
        expect(it.next().value).toEqual(2);
        expect(it.next().value).toEqual(3);
        expect(it.next().value).toEqual(4);
        expect(it.next().value).toEqual(5);
      });
    });
  });
});
