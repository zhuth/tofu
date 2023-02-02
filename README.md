# tofu local browser
在本地文件系统下查看 tofu 导出的文件。

## 构建
```shell
npm i .
mkdir build
browserify -e src/backup.js > build/backup.js
browserify -e src/explorer.js > build/explorer.js
cp src/*.html build/
```

## 使用
1. 解压缩 tofu 导出的 zip 文件，将得到的 json 文件置于与 python 脚本同文件夹下。
2. 运行脚本生成 db.js
3. 打开 index.html 使用
