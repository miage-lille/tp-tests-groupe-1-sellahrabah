// Tests unitaires

import { testUser } from "src/users/tests/user-seeds";
import { InMemoryWebinarRepository } from "../adapters/webinar-repository.in-memory";
import { Webinar } from "../entities/webinar.entity";
import { ChangeSeats } from "./change-seats";
import { WebinarNotFoundException } from "../exceptions/webinar-not-found";
import { WebinarReduceSeatsException } from "../exceptions/webinar-reduce-seats";
import { WebinarTooManySeatsException } from "../exceptions/webinar-too-many-seats";


describe('Feature : Change seats', () => {
  let webinarRepository: InMemoryWebinarRepository;
  let useCase: ChangeSeats;

  const webinar = new Webinar({
    id: '12H6-TBS8-36DH-D62D',
    organizerId: testUser.alice.props.id,
    title: 'Webinar title',
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-01-01T01:00:00Z'),
    seats: 100,
  });

  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    useCase = new ChangeSeats(webinarRepository);
  });

  describe('Scenario: Webinar does not exist', () => {
    const payload = {
      user: testUser.alice,
      webinarId: '12HD-JSYZ-EYDH-DY32',
      seats: 200,
    };

    it('should fail', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(WebinarNotFoundException);

      const existingWebinar = await webinarRepository.findById('12H6-TBS8-36DH-D62D');
      expect(existingWebinar?.props.seats).toEqual(100);
    });
  });

  describe('Scenario: Reduce seats to an inferior number', () => {
    const payload = {
      user: testUser.alice,
      webinarId: '12H6-TBS8-36DH-D62D',
      seats: 50,
    };

    it('should throw a WebinarReduceSeatsException', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(WebinarReduceSeatsException);

      const existingWebinar = await webinarRepository.findById('12H6-TBS8-36DH-D62D');
      expect(existingWebinar?.props.seats).toEqual(100);
    });
  });

  describe('Scenario: Too many seats', () => {
    const payload = {
      user: testUser.alice,
      webinarId: '12H6-TBS8-36DH-D62D',
      seats: 1001,
    };

    it('should throw a WebinarTooManySeatsException', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(WebinarTooManySeatsException);

      const existingWebinar = await webinarRepository.findById('12H6-TBS8-36DH-D62D');
      expect(existingWebinar?.props.seats).toEqual(100);
    });
  });

  describe('Scenario: Happy path', () => {
    const payload = {
      user: testUser.alice,
      webinarId: '12H6-TBS8-36DH-D62D',
      seats: 200,
    };

    it('should change the number of seats for a webinar', async () => {
      await useCase.execute(payload);

      const updatedWebinar = await webinarRepository.findById('12H6-TBS8-36DH-D62D');
      expect(updatedWebinar?.props.seats).toEqual(200);
    });
  });
});
