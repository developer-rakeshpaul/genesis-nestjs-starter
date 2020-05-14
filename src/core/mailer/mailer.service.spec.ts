// import { getRandomString } from './../../common/utils/uuid.generator';
// import { mailerConfig } from './mailer.config';
// import { MailerModule } from '@nest-modules/mailer';
// import { MailService } from './mailer.service';
// import { expect } from 'chai';
// import { Test } from '@nestjs/testing';
// import { TestingModule } from '@nestjs/testing/testing-module';
// import { getRepositoryToken } from '@nestjs/typeorm'; // Not publicly exposed
// import { Repository } from 'typeorm';
// import sinon from 'sinon';

// describe('MailService', () => {
//   let sandbox: sinon.SinonSandbox;
//   let mailerService: MailService;

//   beforeEach(async () => {
//     sandbox = sinon.createSandbox();
//     const module = await Test.createTestingModule({
//       imports: [MailerModule.forRoot(mailerConfig)],
//       providers: [MailService],
//     }).compile();

//     mailerService = module.get<MailService>(MailService);
//   });

//   afterEach(() => {
//     sandbox.restore();
//   });

//   it('should exist', async () => {
//     expect(mailerService).to.exist;
//   });
//   it('should send an email', async () => {
//     try {
//       await mailerService.sendConfirmationEmail(
//         'rakeshpaul@gmail.com',
//         getRandomString('rakeshpaul@gmail.com'),
//       );
//     } catch (error) {
//       console.log(error);
//     }
//   });
// });
