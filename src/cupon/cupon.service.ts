import { Injectable } from '@nestjs/common';
import { CreateCuponDto } from './dto/create-cupon.dto';
import { UpdateCuponDto } from './dto/update-cupon.dto';

@Injectable()
export class CuponService {
  create(createCuponDto: CreateCuponDto) {
    return 'This action adds a new cupon';
  }

  findAll() {
    return `This action returns all cupon`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cupon`;
  }

  update(id: number, updateCuponDto: UpdateCuponDto) {
    return `This action updates a #${id} cupon`;
  }

  remove(id: number) {
    return `This action removes a #${id} cupon`;
  }
}
