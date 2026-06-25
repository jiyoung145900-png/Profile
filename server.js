const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/render', upload.fields([{name: 'video'}, {name: 'logo'}]), (req, res) => {
    const { x, y, w, name, info } = req.body;
    const video = req.files['video'][0].path;
    const logo = req.files['logo'][0].path;
    const output = `output_${Date.now()}.gif`;

    // FFmpeg 명령어: 로고 합성 + 텍스트 추가 + 고화질 팔레트 적용
    const cmd = `ffmpeg -i ${video} -i ${logo} -filter_complex "[1:v]scale=${w}:-1[logo];[0:v][logo]overlay=${x}:${y},drawtext=text='${name}':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=550,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -f gif ${output}`;

    exec(cmd, (err) => {
        if (err) return res.status(500).send("렌더링 실패");
        res.download(output); // 결과물 즉시 다운로드
    });
});

app.listen(3000, () => console.log('서버 실행 중...'));
