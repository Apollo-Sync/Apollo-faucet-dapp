**Smart Contracts**
```
0xCe88Cd7abd9Ed6F9CD21958ea4200a69300993B7
```
**What is this dapp ?**
```
Just simple dapp, users enter dapp and faucet , done ! 
```

**Tree structure**
```
Web3-faucet-dapp/
├── contracts/
│   ├── ApolloToken.sol
│   └── TokenFaucet.sol
├── scripts/
│   └── deploy.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── ethereum.js   // file chứa address & ABI
│   └── package.json
├── hardhat.config.js
├── .env
├── package.json
└── README.md
```

**1. Setup version nodejs + npm**
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```
```
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```
```
nvm install 22
nvm use 22
nvm alias default 22
```
**Check version**
```
node -v    # → v22.xx.x
npm -v     # → 10.xx.x
```

**2. install dependencies**
```
cd Web3-faucet-dapp
```

```
npm install
```

```
npm install dotenv
```

```
cd backend
npm install
cd ..
```

```
npm install @openzeppelin/contracts
```

**3. Create your .env file**
```
PRIVATE_KEY=0xabc123...your_real_private_key_here
INFURA_API_KEY=your_infura_or_alchemy_key_if_you_have  # Tùy chọn, nếu dùng Infura/Alchemy
```
```
git rm --cached .env
```

**4.Frontend**
```
cd frontend
npx create-react-app .
npm install ethers
```

**5. Deploy contracts**
```
npx hardhat clean
npx hardhat run scripts/deploy.js --network sepolia
```

**6. Create sever game (You need open 2 terminal with tmux)**

- Allow port
```
sudo ufw allow 8000
```

- Running backend
```
cd ~/arm-wrestling-web3/backend
node server.js
```

- running frontend
```
cd ~/arm-wrestling-web3/frontend
python3 -m http.server 8000
```
**7. enter game**
```
http://IP:port
ex: http://23.88.48.244:8000/
```








