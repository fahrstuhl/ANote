#!/usr/bin/env bash

platform=basalt
if [ "$1" != "" ]; then
    platform="$1"
fi
includePath="$(pebble sdk include-path "$platform")"
includePath=${includePath%/SDKs*}
platformIncludes="$includePath/SDKs/current/sdk-core/pebble/$platform/include"
armIncludes="$includePath/SDKs/current/toolchain/arm-none-eabi/arm-none-eabi/include"

tee compile_commands.json <<EOF
[
    {
        "directory": "$PWD",
        "arguments": [
            "gcc",
            "-I$armIncludes",
            "-I$platformIncludes",
            "-Ibuild/include/",
            "-Iinclude/",
            "-Ibuild/basalt/"
        ],
        "file": "*.*"
    }
]
EOF
