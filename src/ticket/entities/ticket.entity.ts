import { Cupon } from "src/cupon/entities/cupon.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Ticket {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column(`float`,{
        default: 0
    })
    total: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaEmitida: Date

@OneToOne(() => Cupon, cupon => cupon.ticket)
  @JoinColumn()  // JoinColumn debe estar en el lado propietario de la relación
  cupon: Cupon;
    
}
