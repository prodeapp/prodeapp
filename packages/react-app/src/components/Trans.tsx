import React from "react";

export function Trans({children}: {children: React.ReactNode}) {
    return <>{children}</>
}

export function Plural({value, one, other}: {value: string, one: string, other: string}) {
    return <>{value}</>
}

export function t(msg: string) {
    return msg;
}