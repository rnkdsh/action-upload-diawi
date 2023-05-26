"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const diawi_1 = require("./diawi");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core.getInput('token', { trimWhitespace: true });
            const file = core.getInput('file', { trimWhitespace: true });
            core.debug(`file: ${file}`);
            const password = core.getInput('password', { trimWhitespace: true });
            // core.debug(`password: ${password}`)
            const recipients = core.getInput('recipients', { trimWhitespace: true });
            core.debug(`recipients: ${recipients}`);
            const wallOfApps = core.getInput('wall_of_apps', { trimWhitespace: true }) === 'true';
            core.debug(`wallOfApps: ${wallOfApps}`);
            const findByUdid = core.getInput('find_by_udid', { trimWhitespace: true }) === 'true';
            core.debug(`findByUdid: ${findByUdid}`);
            const installationNotifications = core.getInput('installation_notifications', { trimWhitespace: true }) ===
                'true';
            core.debug(`installationNotifications: ${installationNotifications}`);
            const dryRun = core.getInput('dry-run', { trimWhitespace: true }) === 'true';
            core.debug(`dryRun: ${dryRun}`);
            const comment = core.getInput('comment', { trimWhitespace: true });
            core.debug(comment); // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
            const { url, qrcode } = yield (0, diawi_1.uploadToDiawi)({
                token,
                file,
                password,
                recipients,
                wallOfApps,
                findByUdid,
                installationNotifications,
                dryRun,
                comment
            });
            core.debug(`url: ${url}`);
            core.setOutput('url', url);
            core.debug(`qrcode: ${qrcode}`);
            core.setOutput('qrcode', qrcode);
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
run();
