"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToDiawi = void 0;
const node_fs_1 = require("node:fs");
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const UPLOAD_URL = 'https://upload.diawi.com';
const POLL_MAX_COUNT = 10;
const POLL_INTERVAL = 2;
function uploadToDiawi(args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(0, node_fs_1.existsSync)(args.file)) {
            throw new Error(`Could not find file at ${args.file}`);
        }
        const file = (0, node_fs_1.createReadStream)(args.file);
        const data = new form_data_1.default();
        data.append('token', args.token);
        data.append('file', file);
        data.append('password', args.password);
        data.append('callback_emails', args.recipients);
        data.append('wall_of_apps', args.wallOfApps ? '1' : '0');
        data.append('find_by_udid', args.findByUdid ? '1' : '0');
        data.append('installation_notifications', args.installationNotifications ? '1' : '0');
        data.append('comment', args.comment);
        const response = yield axios_1.default.post(UPLOAD_URL, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        const job = response.data.job;
        return pollUploadStatus(job, args.token);
    });
}
exports.uploadToDiawi = uploadToDiawi;
function pollUploadStatus(job, token) {
    return __awaiter(this, void 0, void 0, function* () {
        let pollCount = 0;
        while (pollCount < POLL_MAX_COUNT) {
            const response = yield axios_1.default.get(`${UPLOAD_URL}/status?job=${job}&token=${token}`);
            switch (response.data.status) {
                case 2000:
                    if (response.data.link) {
                        return {
                            url: response.data.link,
                            qrcode: response.data.qrcode
                        };
                    }
                    else {
                        throw new Error('Failed to get link from success response');
                    }
                case 2001:
                    // Nothing, this just means poll again
                    break;
                default:
                    throw new Error(`Error in status response - ${response.data.message}`);
            }
            yield sleep(POLL_INTERVAL);
            pollCount++;
        }
        throw new Error('Timed out polling for job completion');
    });
}
const sleep = (seconds) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
});
