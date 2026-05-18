FROM node:20-slim

WORKDIR /workspace

RUN npm install -g @angular/cli@latest

RUN ng new eval-app --skip-git --skip-install --style=scss --ssr=false && \
    cd eval-app && \
    npm install && \
    npm install igniteui-angular

WORKDIR /workspace/eval-app

COPY . .

RUN mkdir -p logs/verifier
CMD ["bash"]
