**Contracts**
```
- APT Token     : 0xbf203CBCc6B24315D163C2564d7c2faD6C35bc14
- APT Faucet    : 0x0D88C8230f780D71c0888d3aDA08dc0727569DEC
- APX Token     : 0x16f81f1e3E727943bc6090cb06FC03054F91641d
- APX Faucet    : 0xc9B4C152ec807f78cdb0903E932cb5b9d8bBE417
```
**What is this dapp ?**
```
Just simple dapp, users enter dapp and faucet , done ! 
```

**Tree structure**
```
Web3-faucet-dapp/
├── contracts/
│   ├── APXFaucet.sol
│   ├── APXToken.sol
│   ├── ApolloToken.sol
│   └── TokenFaucet.sol
├── scripts/
│   └── deploy.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── BalanceSidebar.jsx
│   │   │   ├── FaucetCard.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Header.jsx
│   │   │   ├── BalanceSidebar.css
│   │   │   ├── FaucetCard.css
│   │   │   ├── Footer.css
│   │   │   └── Header.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   └── ethereum.js         # chứa contract address & ABI
│   └── package.json             # package.json của frontend (React/Vite/...)
├── hardhat.config.js
├── .env                         # bảo mật – KHÔNG commit lên git
├── .gitignore
├── package.json                 # root package.json – chủ yếu cho Hardhat
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
INFURA_PROJECT_ID=your_infura_or_alchemy_key_if_you_have  # Tùy chọn, nếu dùng Infura/Alchemy
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

**6. Create sever game (You need open terminal with tmux)**

- Allow port
```
sudo ufw allow 8000
```

- running frontend
```
cd ~/Web3-faucet-dapp/frontend
npm install 
npm run build
```

```
cd build
python3 -m http.server 8000
```
**7. enter game**
```
http://IP:port
ex: http://23.88.48.244:8000/
```



















