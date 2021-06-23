conf.json
  企业公布并使用的钱包地址，API服务器地址等参数，企业应该根据自己的需求和区块链节点状况调整。

doNotShare.json
  企业用于产品授权通证化的参数。这个文件不应该放到公共HTTP服务器上，应该保留在企业内部操作环境，由相关工作人员使用。
  密码使用最基本的防止泄露方式，即由“doNotShare.json”提供一部分，另一部分由作用环境工作人员输入。由于内网建设和
  日常操作是两套人员，企业品牌保护部门应将这两部分密钥分别交给这两个部门，这样能一定限度的保障完整密钥不被泄露。


myAddressBook.json
  这个文件用于描述您企业钱包信息，请使用JSON格式编写。
    accountRS - 以"CC14-"开头的钱包地址,
    name - 钱包所属机构名称
    address - 地址
    contact - 联系方式,
    expDateMa - 账号截止日期, 用于限制钱包使用期限
    level -
      0 应用开发 Developer
      1 产品授权 Issuance
      2 产品激活 Product Activation
      3 零售 Retail
      4 物流 Logistics
      5 产品服务 Services
      6 焚毁 Burner
    （企业可根据自己的需求修改 level）


myAssetBook.json
  这个文件用于描述商品，为获得GS1国际商品条码的产品请到相关部门申请。
    bcLink - barcode link, 这是每个条码产品的官方链接，提供更详细的产品介绍。
    acLink - anti-counterfeit link, 每个条码的官方防伪鉴定链接。“权益申请”将默认使用这个链接提供的脚本。
