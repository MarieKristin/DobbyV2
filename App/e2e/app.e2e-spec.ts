import { TransportsystemPage } from './app.po';

describe('transportsystem App', function() {
  let page: TransportsystemPage;

  beforeEach(() => {
    page = new TransportsystemPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
