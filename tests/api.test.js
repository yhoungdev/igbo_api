import chai from 'chai';
import chaiHttp from 'chai-http';
import { keys, isEqual } from 'lodash';
import server from '../server';
import { NO_PROVIDED_TERM } from '../utils/constants/errorMessages';
import { searchTerm, searchMockedTerm } from './shared/commands';

process.env.NODE_ENV = 'test';
const { expect } = chai;

chai.use(chaiHttp);

describe('Words', () => {
    describe('/GET words', () => {
        it('should return back word information', (done) => {
            const keyword = 'agụū';
            searchTerm(keyword)
            .end((_, res) => {
                expect(res.status).to.equal(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.keys(keyword);
                done();
            });
        });

        it('should return an error for searching no word', (done) => {
            searchTerm()
            .end((_, res) => {
                expect(res.status).to.equal(400);
                expect(res.text).to.equal(NO_PROVIDED_TERM);
                done();
            });
        });

        it('should return the same term information', (done) => {
            searchTerm('ndi ndi')
            .end(async (_, { status, body: normalizeData }) => {
                expect(status).to.equal(200);
                const { status: rawStatus, body: rawData } = await searchTerm('ndị ndi');
                expect(rawStatus).to.equal(200);
                expect(isEqual(normalizeData, rawData)).to.equal(true);
                done();
            });
        });
    });

    describe('Regex Search', () => {
        it('should return term information without included dashes', (done) => {
            const res = searchMockedTerm('bia');
            expect(res).to.be.an('object');
            keys(res).forEach((key) => {
                expect(key.charAt(0)).to.equal('-');
            });
            done();
        });

        it('should return term with apostrophe by using spaces', (done) => {
            const res = searchMockedTerm('n oge');
            expect(res).to.be.an('object');
            expect(keys(res)[0]).to.equal("n'oge");
            done();
        });

        it('should return term with apostrophe by using apostrophe', (done) => {
            const res = searchMockedTerm("n'oge");
            expect(res).to.be.an('object');
            expect(keys(res)[0]).to.equal("n'oge");
            done();
        });
    });
});

after(() => server.close());