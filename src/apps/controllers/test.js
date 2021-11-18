const frm = (req, res)=>{
    res.send(`
        <form method="POST">
            <input type="text" name="data[key1][key2]"/>
            <button type="submit">Send</button>
        </form>
    `);
}
const postFrm = (req, res)=>{
    const data = req.body;
    console.log(data);  //  { data: { key1: { key2: 'iphone' } } }
}
const test = (req, res)=>{
    console.log(req.body.file);
}
module.exports = {
    frm:frm,
    postFrm:postFrm,
    test:test,
}


