import * as fs from 'fs'
import { IRule } from "src/data/types"

const filePath = 'src/data/data.json'

export function readFileJSON(filePath: string) {
    if (!fs.existsSync(filePath)) return
    return JSON.parse(fs.readFileSync(filePath).toString())
}

export function writeFileJSON(filename: string, obj: any) {
    return fs.writeFileSync(filename, JSON.stringify(obj))
}

export function updateFileJSON(filePath: string, f: (data: any) => any): any {
    const data = readFileJSON(filePath)
    const res = f(data)
    writeFileJSON(filePath, res)
    return res
}

export const api = {
    get(): IRule[] {
        return readFileJSON(filePath)
    },
    add(data: IRule): void {
        const fileData = readFileJSON(filePath)
        if (fileData) {
            fileData.push(data)
            return writeFileJSON(filePath, fileData)
        } else {
            return writeFileJSON(filePath, [data])
        }
    },
    update(data: IRule): void {
        function updateIRule() {
            const fileData = readFileJSON(filePath)
            const findedIndex = fileData.findIndex(el => el.id === data.id)
            if (findedIndex >= 0) {
                fileData.splice(findedIndex, 1, data)
                return fileData
            } else {
                return fileData
            }
        }
        updateFileJSON(filePath, updateIRule)
    },
    delete(id: string): void {
        function deleteIRule() {
            const fileData = readFileJSON(filePath)
            const findedIndex = fileData.findIndex(el => el.id === id)
            if (findedIndex >= 0) {
                fileData.splice(findedIndex, 1)
                return fileData
            } else {
                return fileData
            }
        }
        updateFileJSON(filePath, deleteIRule)
    }
}
