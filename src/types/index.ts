export interface IFunction {
    name: string,
    arguments: any[]
}

export interface ICondition {
    id: string,
    textIncludes: string, // строка которая должна содержаться в расшифрованном тексте
    f: IFunction // вызов функция которая вернет boolean
}

export interface IRule {
    name: string,
    id: string,
    condition: ICondition[] // массив условий
    action: IFunction // действие
}
