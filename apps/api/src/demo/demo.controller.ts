import { Controller, Get, Post, Body } from '@nestjs/common';
import { DemoService } from './demo.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Public()
  @Get('state')
  getState() {
    return {
      success: true,
      data: this.demoService.getState(),
    };
  }

  @Public()
  @Post('next')
  nextStep() {
    return {
      success: true,
      data: this.demoService.nextStep(),
    };
  }

  @Public()
  @Post('previous')
  previousStep() {
    return {
      success: true,
      data: this.demoService.previousStep(),
    };
  }

  @Public()
  @Post('step')
  setStep(@Body('step') step: number) {
    return {
      success: true,
      data: this.demoService.setStep(Number(step)),
    };
  }

  @Public()
  @Post('play')
  play() {
    return {
      success: true,
      data: this.demoService.play(),
    };
  }

  @Public()
  @Post('pause')
  pause() {
    return {
      success: true,
      data: this.demoService.pause(),
    };
  }

  @Public()
  @Post('reset')
  async reset() {
    const data = await this.demoService.reset();
    return {
      success: true,
      message: 'Demo simulation state cleanly reset',
      data,
    };
  }
}
