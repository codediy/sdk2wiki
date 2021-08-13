const fs = require("fs");
const log = function (...msg) {
    console.log(msg);
}

class WikiParser {

    all() {
        this.Api = {}
        this.api();
        this.enumApi();
        this.structApi();
        this.categoryApi();
    }

    // 读取函数api
    api() {
        this.getList("CategoryAPI.mediawiki")
    }

    // 读取枚举信息
    enumApi() {
        this.getList("CategoryEnum.mediawiki")
    }

    // 读取结构体信息
    structApi() {
        this.getList("CategoryStruct.mediawiki")
    }

    // 分类读取
    categoryApi() {
        fs.readFile("APIByCategory.mediawiki", "utf-8", (err, data) => {
            if (err) {
                console.log("read categoryApi", "err", err);
            }
            // console.log("c",data);
            let lines = data.split("\r\n");
            // console.log("lines",lines);
            let apis = {};
            let currentApi = "";
            let currentIndex = 0;
            lines.forEach(line => {
                if (line.includes("==")) {
                    currentApi = line.replace(/==/g, "").trim();

                    apis[currentApi] = apis[currentApi]
                        ? apis[currentApi]
                        : [];
                } else if (line.includes("|[[")) {
                    apis[currentApi].push({
                        page: "",
                        title: "",
                        link: "",
                        file: ""
                    });
                    currentIndex = apis[currentApi].length - 1;
                    let temp = line.replace("|[[", "")
                        .replace("]]", "")
                        .split("|");
                    apis[currentApi][currentIndex]["page"] = temp[0];
                    apis[currentApi][currentIndex]["title"] = temp[1];
                } else if (line.includes("|[http")) {
                    let temp = line.replace("|[", "")
                        .replace("]", "")
                        .split(" ");
                    apis[currentApi][currentIndex]["link"] = temp[0];
                    apis[currentApi][currentIndex]["file"] = temp[1];
                }
            })
            this.writeList("Category.mediawiki", apis);
        })
    }

    getList(file) {
        fs.readFile(file, "utf-8", (err, data) => {
            if (err) {
                console.log("read" + file, "err", err);
            }
            // console.log("data",data);
            let listReg = /\[\[(.*)\]\]/g;
            let matchList = data.match(listReg).filter(m => {
                return m.includes("SDL");
            }).map(m => {
                // log("m",m);
                // return m;
                return m.replace(/[\[\]]/g, "");
            });
            // console.log("list", matchList);
            this.writeList(file, matchList);
        })
    }

    writeList(file, apis) {
        let toFile = "api/" + file.replace(".mediawiki", ".json");
        log("toFile", toFile);
        let data = JSON.stringify(apis, " ", 2);
        fs.writeFile(toFile, data, (err) => {
            if (err) {
                log("write" + file, "err", err.toString())
            } else {
                log("write" + file, "ok")
            }
        })
    }
}

let n = new WikiParser();
n.all();