#!/bin/sh
set -eu
cd "$(dirname "$0")"
printf '\n创作家 · Mac 本地版\n'
pause() { printf '\n按回车关闭窗口。'; read -r _ || true; }
fail() { printf '\n启动失败：%s\n' "$1" >&2; pause; exit 1; }

node_bin=''
if command -v node >/dev/null 2>&1 && node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 22 ? 0 : 1)' >/dev/null 2>&1; then
  node_bin=$(command -v node)
fi

if [ -z "$node_bin" ]; then
  [ "$(uname -s)" = 'Darwin' ] || fail '这个启动器只用于 Mac。'
  case "$(uname -m)" in
    arm64) arch=arm64; expected='1f5ac075be50bed4780ea3be19a007fda95ea4d527d28d76d0b91de47d915115' ;;
    x86_64) arch=x64; expected='6965578fd823e72c1b5387f5ab84cb25368f886e02eb8779e6f0fce6b91c27b7' ;;
    *) fail '仅支持 Apple 芯片或 Intel 64 位 Mac。' ;;
  esac
  version='24.22.2'
  name="node-v${version}-darwin-${arch}"
  cache='runtime/mac'
  node_bin="$(pwd)/${cache}/${name}/bin/node"
  if [ ! -x "$node_bin" ]; then
    command -v curl >/dev/null 2>&1 || fail '缺少系统下载工具 curl。'
    command -v shasum >/dev/null 2>&1 || fail '缺少系统校验工具 shasum。'
    mkdir -p "$cache" || fail '无法写入解压后的文件夹。请移到下载目录再试。'
    work=$(mktemp -d "${cache}/.prepare.XXXXXX") || fail '无法创建临时目录。'
    trap 'rm -rf "$work"' EXIT HUP INT TERM
    printf '首次启动：正在从 Node.js 官方下载 Mac 运行环境。完成后会保存在本文件夹，后续无需重复下载。\n'
    url="https://nodejs.org/dist/v${version}/${name}.tar.xz"
    curl --fail --location --proto '=https' --proto-redir '=https' --tlsv1.2 --connect-timeout 15 --max-time 360 --retry 2 --output "$work/node.tar.xz" "$url" || fail '下载失败。请检查网络连接，稍后重新双击。'
    actual=$(shasum -a 256 "$work/node.tar.xz" | awk '{print $1}')
    [ "$actual" = "$expected" ] || fail '下载文件校验未通过，不会运行该文件。请稍后重试。'
    tar -xJf "$work/node.tar.xz" -C "$work" || fail '运行环境解压失败。请检查磁盘空间。'
    [ -x "$work/$name/bin/node" ] || fail '运行环境文件不完整。'
    "$work/$name/bin/node" -e 'process.exit(process.versions.node === "24.22.2" ? 0 : 1)' || fail '运行环境版本检查失败。'
    mv "$work/$name" "$cache/$name" || fail '无法保存运行环境。'
    printf '运行环境已准备好。\n'
  fi
fi

printf '正在启动。浏览器若没有自动打开，请访问 http://127.0.0.1:4317\n关闭此窗口即可停止本地服务。\n'
"$node_bin" server.mjs --open || fail '本地服务未启动。若端口已占用，请关闭之前的创作家窗口。'
pause
