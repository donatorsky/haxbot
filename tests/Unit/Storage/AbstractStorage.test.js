import {AbstractStorage} from "../../../src/Storage/AbstractStorage";

const storage = new AbstractStorage();

test('AbstractStorage cannot get values', () => expect(storage.get).toThrowError(/^Method get\(\) not implemented$/));
test('AbstractStorage cannot set values', () => expect(storage.set).toThrowError(/^Method set\(\) not implemented$/));
test('AbstractStorage cannot has values', () => expect(storage.has).toThrowError(/^Method has\(\) not implemented$/));
test('AbstractStorage cannot all values', () => expect(storage.all).toThrowError(/^Method all\(\) not implemented$/));
