// Imports the server.js file to be tested.
const server = require("../src/server");
// Assertion (Test Driven Development) and Should,  Expect(Behaviour driven
// development) library
const chai = require("chai");
// Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);
const { assert, expect } = chai;

describe("Server!", () => {
  // Sample test case given to test / endpoint.
  it('Search returns an element', (done) => {
    chai
      .request(server)
      .get("/get_search")
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals("success");
        assert.strictEqual(res.body.message, "Welcome!");
        done();
      });
  });

  it('Post Reviews Fails', (done) => {
    chai
      .request(server)
      .get('/main/postreview')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(Array.isArray(res.body)).to.equals(true);
        expect(res.body.length).to.be.above(0);

        done();
      });
  });

});
