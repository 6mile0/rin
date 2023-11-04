export type Container = {
    prefix: string,
    lang: string,
    filename: string,
    id: string,
    containerId: string
}

export type ContainerLists = Array<Container>

export type execLang = "py" | "c" | "java" | "nako3";

export type containerType = "c1" | "c2" | "c3" | "c5";

export type resList = {
    code: string,
    success: boolean,
    error?: string,
    stdout?: string,
    stderr?: string,
    output?: string,
}
