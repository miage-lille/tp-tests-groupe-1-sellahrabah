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

  const existingWebinarId = '12H6-TBS8-36DH-D62D';
  const initialSeats = 100;

  const webinar = new Webinar({
    id: existingWebinarId,
    organizerId: testUser.alice.props.id,
    title: 'Webinar title',
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-01-01T01:00:00Z'),
    seats: initialSeats,
  });

  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    useCase = new ChangeSeats(webinarRepository);
  });

  // Méthodes partagé
  async function whenUserChangeSeatsWith(payload: { user: any; webinarId: string; seats: number }) {
    await useCase.execute(payload);
  }

  async function expectWebinarToRemainUnchanged() {
    const unchangedWebinar = await webinarRepository.findById(existingWebinarId);
    expect(unchangedWebinar?.props.seats).toEqual(initialSeats);
  }

  async function thenUpdatedWebinarSeatsShouldBe(seats: number) {
    const updatedWebinar = await webinarRepository.findById(existingWebinarId);
    expect(updatedWebinar?.props.seats).toEqual(seats);
  }

  describe('Scenario: Webinar does not exist', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'hgf6-GHGJ-4FJH-3FJH',
      seats: 200,
    };

    it('should throw WebinarNotFoundException', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(WebinarNotFoundException);
      await expectWebinarToRemainUnchanged();
    });
  });

  describe('Scenario: Reduce seats to an inferior number', () => {
    const payload = {
      user: testUser.alice,
      webinarId: existingWebinarId,
      seats: 50,
    };

    it('should throw WebinarReduceSeatsException', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(WebinarReduceSeatsException);
      await expectWebinarToRemainUnchanged();
    });
  });

  describe('Scenario: Too many seats', () => {
    const payload = {
      user: testUser.alice,
      webinarId: existingWebinarId,
      seats: 1001,
    };

    it('should throw WebinarTooManySeatsException', async () => {
      await expect(useCase.execute(payload)).rejects.toThrow(WebinarTooManySeatsException);
      await expectWebinarToRemainUnchanged();
    });
  });

  describe('Scenario: Happy path', () => {
    const payload = {
      user: testUser.alice,
      webinarId: existingWebinarId,
      seats: 200,
    };

    it('should change the number of seats for a webinar', async () => {
      await whenUserChangeSeatsWith(payload);
      await thenUpdatedWebinarSeatsShouldBe(200);
    });
  });
});
