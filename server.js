const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const upload = multer({ dest: 'uploads/' });

// 서버 실행
app.use(express.static('.')); // 현재 폴더의 index.html을 서비스함

app.post('/render', upload.fields([{name: 'video'}, {name: 'logo'}]), (req, res) => {
    const { x, y, w, name, info } = req.body;
    const video = req.files['video'][0].path;
    const logo = req.files['logo'][0].path;
    const output = `output_${Date.now()}.gif`;

    // 실장님 PC의 FFmpeg를 호출하여 로고+자막 합치기
    const cmd = `ffmpeg -i ${video} -i ${logo} -filter_complex "[1:v]scale=${w}:-1[logo];[0:v][logo]overlay=${x}:${y},drawtext=text='${name}':fontcolor=white:fontsize=28:x=(w-text_w)/2:y=550,drawtext=text='${info}':fontcolor=white:fontsize=16:x=(w-text_w)/2:y=580,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -f gif ${output}`;

    exec(cmd, (err) => {
        if (err) { console.error(err); return res.status(500).send("렌더링 에러"); }
        res.download(output, 'BANADA_HQ.gif', () => {
            fs.unlinkSync(video); fs.unlinkSync(logo); fs.unlinkSync(output); // 임시파일 삭제
        });
    });
});

app.listen(3000, () => console.log('BANADA 서버 가동 중: http://localhost:3000'));
